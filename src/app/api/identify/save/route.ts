import { NextResponse } from "next/server";
import { z } from "zod";
import { completeDiscovery } from "@/lib/activity-completions";
import { getDiscoveryLocationMeta } from "@/lib/discover/location";
import { buildMushroomSafetyNote, mapDiscoverModeToCatalogCategory } from "@/lib/discoveries";
import { discoverCategorySchema, identifyResponseSchema } from "@/lib/identify";
import { getRankForCompletedAdventures } from "@/lib/students";
import { createClient } from "@/lib/supabase/server";

const saveIdentifySchema = z.object({
  studentId: z.string().uuid().optional(),
  selectedCategory: discoverCategorySchema,
  result: identifyResponseSchema.optional(),
  notes: z.string().trim().max(600).optional(),
  locationLabel: z.string().trim().max(160).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  observedAt: z.string().optional()
});

export async function POST(request: Request) {
  let uploadedFilePath: string | null = null;
  let createdDiscoveryId: string | null = null;
  let createdPortfolioEntryId: string | null = null;
  let createdCompletionId: string | null = null;
  let rollbackStudentId: string | null = null;
  let rollbackUserId: string | null = null;
  let rollbackNewBadgeIds: string[] = [];
  let rollbackNewAchievementIds: string[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    const image = formData.get("image");

    if (typeof rawPayload !== "string") {
      return NextResponse.json({ error: "Invalid save request." }, { status: 400 });
    }

    const parsed = saveIdentifySchema.safeParse(JSON.parse(rawPayload));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid save request." }, { status: 400 });
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "An image is required to save this discovery." }, { status: 400 });
    }

    let student: { id: string; name: string } | null = null;
    if (parsed.data.studentId) {
      const { data: studentRow } = await supabase
        .from("students")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("id", parsed.data.studentId)
        .maybeSingle();

      if (!studentRow) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
      }

      student = studentRow;
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const filePath = `${user.id}/discoveries/${Date.now()}-${image.name}`;
    uploadedFilePath = filePath;

    const { error: uploadError } = await supabase.storage.from("leaf-photos").upload(filePath, bytes, {
      contentType: image.type,
      upsert: false
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const imageUrl = supabase.storage.from("leaf-photos").getPublicUrl(filePath).data.publicUrl;
    const catalogCategory = mapDiscoverModeToCatalogCategory(parsed.data.result?.category || parsed.data.selectedCategory || "animal");
    const savedAt = parsed.data.observedAt ?? new Date().toISOString();
    const locationMeta = getDiscoveryLocationMeta({
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      locationLabel: parsed.data.locationLabel ?? null
    });
    const baseResult = parsed.data.result ?? {
      possible_identification: "Unknown discovery",
      scientific_name: "",
      confidence_level: "low" as const,
      category: catalogCategory,
      key_features: ["Photo saved before identification was completed."],
      look_alikes: [],
      safety_note: "Identification was not completed, so treat this as an unknown nature find.",
      wsa_observation_challenge: "Return to this spot later and look for one more clue about what you found.",
      journal_prompt: "What did you notice first, and what would help you identify it more confidently next time?",
      facebook_caption: "Today we saved a mystery discovery for our Wild Stallion Academy field notebook.",
      observed_near: locationMeta.observedNear,
      region_label: locationMeta.regionLabel,
      regional_plausibility: "unknown" as const,
      regional_plausibility_note: `Saved as an unknown discovery from ${locationMeta.regionLabel}.`,
      local_look_alikes: [],
      regulation_status: "unknown" as const,
      season_note: "Regulation status unavailable for this unknown discovery.",
      bag_limit_note: "",
      size_limit_note: "",
      protected_note: "",
      gear_rule_note: "",
      regulation_source: "",
      regulation_source_url: "",
      regulation_last_checked: ""
    };
    const result =
      catalogCategory === "mushrooms"
        ? {
            ...baseResult,
            safety_note: buildMushroomSafetyNote(baseResult.safety_note)
          }
        : baseResult;

    const { data: discovery, error: discoveryError } = await supabase
      .from("discoveries")
      .insert({
        user_id: user.id,
        student_id: parsed.data.studentId ?? null,
        category: catalogCategory,
        common_name: result.possible_identification,
        scientific_name: result.scientific_name || null,
        confidence_level: result.confidence_level,
        image_url: imageUrl,
        image_alt: `${result.possible_identification} discovery photo`,
        notes: parsed.data.notes?.trim() || null,
        result_json: result,
        location_label: locationMeta.locationLabel,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
        observed_at: savedAt
      })
      .select("id, user_id, student_id, category, common_name, scientific_name, confidence_level, image_url, image_alt, notes, result_json, location_label, latitude, longitude, observed_at, created_at")
      .single();

    if (discoveryError) {
      throw new Error(discoveryError.message);
    }

    createdDiscoveryId = discovery.id;

    let completionResult: Awaited<ReturnType<typeof completeDiscovery>> | null = null;
    let entry: { id: string } | null = null;

    if (parsed.data.studentId) {
      const { data: portfolioEntry, error: portfolioError } = await supabase
        .from("portfolio_entries")
        .insert({
          student_id: parsed.data.studentId,
          completion_id: null,
          title: `${result.possible_identification} discovery`,
          entry_type: "field_identification",
          summary: `${result.possible_identification}. ${result.wsa_observation_challenge}`,
          artifact_json: {
            source: "discover",
            discoveryId: discovery.id,
            selectedCategory: parsed.data.selectedCategory,
            catalogCategory,
            imageUrl,
            identification: result.possible_identification,
            scientificName: result.scientific_name || null,
            savedAt,
            location: {
              label: locationMeta.locationLabel,
              regionLabel: locationMeta.regionLabel,
              latitude: parsed.data.latitude ?? null,
              longitude: parsed.data.longitude ?? null
            },
            result
          }
        })
        .select("id")
        .single();

      if (portfolioError) {
        throw new Error(portfolioError.message);
      }

      createdPortfolioEntryId = portfolioEntry.id;

      completionResult = await completeDiscovery({
        supabase,
        userId: user.id,
        studentId: parsed.data.studentId,
        title: `${result.possible_identification} discovery`,
        notes: `Discovery category: ${catalogCategory}`
      });

      createdCompletionId = completionResult.completion.id;
      rollbackStudentId = parsed.data.studentId;
      rollbackUserId = user.id;
      rollbackNewBadgeIds = completionResult.newBadges.map((badge) => badge.id);
      rollbackNewAchievementIds = completionResult.newAchievements.map((achievement) => achievement.id);

      const { error: portfolioLinkError } = await supabase
        .from("portfolio_entries")
        .update({ completion_id: completionResult.completion.id })
        .eq("id", portfolioEntry.id);

      if (portfolioLinkError) {
        throw new Error(portfolioLinkError.message);
      }

      entry = portfolioEntry;
    }

    return NextResponse.json({
      discovery,
      entry,
      studentName: student?.name ?? null,
      imageUrl,
      updatedStudent: completionResult?.updatedStudent ?? null,
      newBadges: completionResult?.newBadges ?? [],
      newAchievements: completionResult?.newAchievements ?? [],
      rankJustReached: completionResult?.rankJustReached ?? null
    });
  } catch (error) {
    try {
      const supabase = await createClient();

      if (createdPortfolioEntryId) {
        await supabase.from("portfolio_entries").delete().eq("id", createdPortfolioEntryId);
      }

      if (createdCompletionId) {
        if (rollbackStudentId && rollbackNewBadgeIds.length) {
          await supabase
            .from("student_badges")
            .delete()
            .eq("student_id", rollbackStudentId)
            .eq("source_completion_id", createdCompletionId)
            .in("badge_id", rollbackNewBadgeIds);
        }

        if (rollbackStudentId && rollbackUserId && rollbackNewAchievementIds.length) {
          await supabase
            .from("student_achievements")
            .delete()
            .eq("student_id", rollbackStudentId)
            .eq("user_id", rollbackUserId)
            .in("achievement_id", rollbackNewAchievementIds);
        }

        await supabase.from("activity_completions").delete().eq("id", createdCompletionId);

        if (rollbackStudentId && rollbackUserId) {
          const { data: completionRows } = await supabase
            .from("activity_completions")
            .select("id, activity_type")
            .eq("user_id", rollbackUserId)
            .eq("student_id", rollbackStudentId);

          const remainingAdventureCount =
            completionRows?.filter((item) => item.activity_type !== "in_person_class").length ?? 0;

          await supabase
            .from("students")
            .update({
              completed_adventures_count: remainingAdventureCount,
              current_rank: getRankForCompletedAdventures(remainingAdventureCount)
            })
            .eq("user_id", rollbackUserId)
            .eq("id", rollbackStudentId);
        }
      }

      if (createdDiscoveryId) {
        await supabase.from("discoveries").delete().eq("id", createdDiscoveryId);
      }

      if (uploadedFilePath) {
        await supabase.storage.from("leaf-photos").remove([uploadedFilePath]);
      }
    } catch {
      // Best-effort rollback: preserve the original error response if cleanup also fails.
    }

    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
