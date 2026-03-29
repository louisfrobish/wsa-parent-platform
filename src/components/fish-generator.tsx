"use client";

import { useEffect, useState, useTransition } from "react";
import { CopyFacebookCaptionButton } from "@/components/copy-facebook-caption-button";
import { FishMediaPanel } from "@/components/fish-media-panel";
import { HistoryList } from "@/components/history-list";
import { LocationContextFields } from "@/components/location-context-fields";
import { RegulationStatusCard } from "@/components/regulation-status-card";
import { RecommendedSpotsList } from "@/components/recommended-spots-list";
import { SafetyStatusCard } from "@/components/safety-status-card";
import { SpeciesPhotoGallery } from "@/components/species-photo-gallery";
import type { FishOutput, GenerationRecord } from "@/lib/generations";
import { harvestAllowedForStatus } from "@/lib/regulations/types";
import { deriveFishBriefingSafetyStatus } from "@/lib/safety-status/derive";
import type { StudentRecord } from "@/lib/students";

type FishGeneratorProps = {
  initialHistory: GenerationRecord[];
  students: StudentRecord[];
  preselectedStudentId?: string;
};

type FishResponse = {
  generation: GenerationRecord;
  output: FishOutput;
};

export function FishGenerator({ initialHistory, students, preselectedStudentId }: FishGeneratorProps) {
  const [history, setHistory] = useState(initialHistory);
  const [result, setResult] = useState<FishOutput | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId ?? "");
  const [locationLabel, setLocationLabel] = useState("Southern Maryland");
  const [radiusMiles, setRadiusMiles] = useState("10");
  const [weatherCondition, setWeatherCondition] = useState("clear");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (preselectedStudentId) setSelectedStudentId(preselectedStudentId);
  }, [preselectedStudentId]);

  const fishSafetyStatus = result ? deriveFishBriefingSafetyStatus(result) : null;

  return (
    <section className="content-grid">
      <article className="panel stack">
        <div>
          <p className="eyebrow">Explorer briefing setup</p>
          <h3>Build today&apos;s fishing field briefing</h3>
          <p className="panel-copy">Generate a practical local fish briefing with water-aware habitat clues, nearby places, and beginner-friendly guidance a family can actually use.</p>
        </div>

        {students.length ? (
          <label>
            Student
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              <option value="">Household briefing</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <LocationContextFields
          locationLabel={locationLabel}
          radiusMiles={radiusMiles}
          weatherCondition={weatherCondition}
          onLocationLabelChange={(value) => setLocationLabel(value)}
          onRadiusMilesChange={(value) => setRadiusMiles(value)}
          onWeatherConditionChange={(value) => setWeatherCondition(value)}
          onCoordinatesResolved={({ latitude: nextLat, longitude: nextLng, locationLabel: nextLabel }) => {
            setLatitude(nextLat);
            setLongitude(nextLng);
            setLocationLabel(nextLabel);
          }}
        />

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError("");
            const selectedStudent = students.find((student) => student.id === selectedStudentId);

            startTransition(async () => {
              const response = await fetch("/api/generate-fish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  requestDate: new Date().toISOString().slice(0, 10),
                  studentId: selectedStudent?.id,
                  studentName: selectedStudent?.name,
                  childAge: selectedStudent?.age,
                  locationLabel,
                  radiusMiles: Number(radiusMiles),
                  weatherCondition,
                  latitude,
                  longitude
                })
              });

              const payload = (await response.json()) as FishResponse | { error: string };
              if (!response.ok || "error" in payload) {
                setError("error" in payload ? payload.error : "Fish generation failed.");
                return;
              }

              setResult(payload.output);
              setHistory((current) => [payload.generation, ...current]);
            });
          }}
        >
          {isPending ? "Generating..." : "Generate fish of the day"}
        </button>

        {error ? <p className="error">{error}</p> : null}
      </article>

      <article className="panel stack">
        <div>
          <p className="eyebrow">Today&apos;s fishing note</p>
          <h3>{result?.fishName || "No fish generated yet"}</h3>
        </div>

        {result ? (
          <div className="stack">
            {result.images?.length ? (
              <SpeciesPhotoGallery title={result.fishName} images={result.images} />
            ) : (
              <FishMediaPanel fishName={result.fishName} speciesSlug={result.speciesSlug} />
            )}
            <div className="result-sections">
              {fishSafetyStatus ? (
                <SafetyStatusCard
                  edibilityStatus={fishSafetyStatus.edibility_status}
                  legalStatus={fishSafetyStatus.legal_status}
                  cautionNote={fishSafetyStatus.caution_note}
                  regulationNote={fishSafetyStatus.regulation_note}
                  safetyNote={fishSafetyStatus.safety_note}
                  sourceNote={fishSafetyStatus.source_note}
                  statusConfidence={fishSafetyStatus.status_confidence}
                />
              ) : null}
              <RegulationStatusCard
                status={result.regulationStatus}
                seasonNote={result.seasonNote}
                bagLimitNote={result.bagLimitNote}
                sizeLimitNote={result.sizeLimitNote}
                protectedNote={result.protectedNote}
                gearRuleNote={result.gearRuleNote}
                source={result.regulationSource}
                sourceUrl={result.regulationSourceUrl}
                lastChecked={result.regulationLastChecked}
              />
              <section>
                <h4>Water type today</h4>
                <p>{result.waterType}</p>
              </section>
              <section>
                <h4>Why this fish fits today</h4>
                <p>{result.broadExplanation}</p>
              </section>
              <section>
                <h4>Likely habitat</h4>
                <p>{result.likelyHabitat}</p>
              </section>
              <section>
                <h4>Best nearby place to try</h4>
                <p>{result.bestNearbyPlaceType}</p>
              </section>
              <section>
                <h4>Best time today</h4>
                <p>{result.bestTimeWindow}</p>
              </section>
              <section>
                <h4>Fishing outlook</h4>
                <p>{result.fishingOutlook}</p>
              </section>
              <section>
                <h4>Best use of the outing</h4>
                <p>{result.bestUseOfOuting}</p>
              </section>
              <section>
                <h4>Best beginner bait</h4>
                <p>{result.bestBeginnerBait}</p>
              </section>
              <section>
                <h4>Best lures</h4>
                <p>{result.optionalLure}</p>
              </section>
              <section>
                <h4>Basic tackle suggestion</h4>
                <p>{result.basicTackleSuggestion}</p>
              </section>
              <section>
                <h4>Why this setup fits</h4>
                <p>{result.whyThisFitsToday}</p>
              </section>
              <section>
                <h4>Safety and access note</h4>
                <p>{result.safetyAccessNote}</p>
              </section>
              <section>
                <h4>Quick family challenge</h4>
                <p>{result.quickChallenge}</p>
              </section>
              {harvestAllowedForStatus(result.regulationStatus) ? (
                <>
                  <section>
                    <h4>Flavor profile</h4>
                    <p>{result.flavorProfile}</p>
                  </section>
                  <section>
                    <h4>Best cooking methods</h4>
                    <ul className="result-list result-list-tight">
                      {result.bestCookingMethods.map((method) => (
                        <li key={method}>{method}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4>Preparation tips</h4>
                    <p>{result.preparationTips}</p>
                  </section>
                </>
              ) : (
                <section>
                  <h4>Harvest note</h4>
                  <p>Identification and learning come first here. Check current Maryland rules before using harvest or cooking guidance.</p>
                </section>
              )}
              <section>
                <h4>Best season</h4>
                <p>{result.bestSeason}</p>
              </section>
              <section>
                <h4>WSA angler tip</h4>
                <p>{result.wsaAnglerTip}</p>
              </section>
              <section>
                <h4>Likely related species</h4>
                <ul className="result-list result-list-tight">
                  {result.likelyRelatedSpecies.map((species) => (
                    <li key={species}>{species}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h4>Facebook caption</h4>
                <p>{result.facebookCaption}</p>
                <div className="cta-row" style={{ marginTop: 12 }}>
                  <CopyFacebookCaptionButton caption={result.facebookCaption} />
                </div>
              </section>
            </div>
            <RecommendedSpotsList
              title="Best nearby water spots to try"
              items={result.recommendedNearbySpots ?? []}
              emptyMessage="No fishable local spot recommendations were available yet. Try a clearer region or use current location."
            />
          </div>
        ) : (
          <p className="panel-copy">Your Fish of the Day field guide will appear here after the first successful run.</p>
        )}
      </article>

      <article className="panel stack" style={{ gridColumn: "1 / -1" }}>
        <div>
          <p className="eyebrow">Field archive</p>
          <h3>Recent fishing briefings</h3>
        </div>
        <HistoryList items={history} emptyMessage="Fish of the Day results will appear here after the first successful run." />
      </article>
    </section>
  );
}
