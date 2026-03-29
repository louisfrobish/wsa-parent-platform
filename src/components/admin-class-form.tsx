"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClassRecord } from "@/lib/classes";

type AdminClassFormProps = {
  initialValues?: ClassRecord | null;
  mode: "create" | "edit";
};

export function AdminClassForm({ initialValues, mode }: AdminClassFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="panel stack"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          const body = {
            title: String(formData.get("title") || ""),
            description: String(formData.get("description") || ""),
            class_type: String(formData.get("class_type") || ""),
            date: String(formData.get("date") || ""),
            start_time: String(formData.get("start_time") || ""),
            end_time: String(formData.get("end_time") || ""),
            location: String(formData.get("location") || ""),
            age_min: Number(formData.get("age_min") || 0),
            age_max: Number(formData.get("age_max") || 0),
            price_cents: Number(formData.get("price_cents") || 0),
            max_capacity: Number(formData.get("max_capacity") || 1),
            spots_remaining: Number(formData.get("spots_remaining") || 0),
            what_to_bring: String(formData.get("what_to_bring") || ""),
            weather_note: String(formData.get("weather_note") || ""),
            internal_notes: String(formData.get("internal_notes") || ""),
            waiver_required: formData.get("waiver_required") === "on",
            status: String(formData.get("status") || "draft")
          };

          const endpoint = mode === "create" ? "/api/admin/classes" : `/api/admin/classes/${initialValues?.id}`;
          const method = mode === "create" ? "POST" : "PATCH";
          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });

          const payload = (await response.json()) as { id?: string; error?: string };

          if (!response.ok || payload.error) {
            setError(payload.error ?? "Could not save class.");
            return;
          }

          router.push(mode === "create" ? `/admin/classes/${payload.id}` : `/admin/classes/${initialValues?.id}`);
          router.refresh();
        });
      }}
    >
      <div>
        <p className="eyebrow">{mode === "create" ? "Create class" : "Edit class"}</p>
        <h3>{mode === "create" ? "Publish a new class" : "Update class details"}</h3>
      </div>

      <div className="content-grid">
        <label>
          Title
          <input name="title" defaultValue={initialValues?.title ?? ""} required />
        </label>
        <label>
          Class type
          <input name="class_type" defaultValue={initialValues?.class_type ?? ""} required />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Description
          <textarea name="description" rows={4} defaultValue={initialValues?.description ?? ""} />
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={initialValues?.date ?? ""} required />
        </label>
        <label>
          Location
          <input name="location" defaultValue={initialValues?.location ?? ""} />
        </label>
        <label>
          Start time
          <input name="start_time" type="time" defaultValue={initialValues?.start_time ?? ""} required />
        </label>
        <label>
          End time
          <input name="end_time" type="time" defaultValue={initialValues?.end_time ?? ""} required />
        </label>
        <label>
          Min age
          <input name="age_min" type="number" min={0} max={18} defaultValue={initialValues?.age_min ?? 5} required />
        </label>
        <label>
          Max age
          <input name="age_max" type="number" min={0} max={18} defaultValue={initialValues?.age_max ?? 12} required />
        </label>
        <label>
          Price (cents)
          <input name="price_cents" type="number" min={0} defaultValue={initialValues?.price_cents ?? 0} required />
        </label>
        <label>
          Max capacity
          <input name="max_capacity" type="number" min={1} defaultValue={initialValues?.max_capacity ?? 12} required />
        </label>
        <label>
          Spots remaining
          <input name="spots_remaining" type="number" min={0} defaultValue={initialValues?.spots_remaining ?? initialValues?.max_capacity ?? 12} required />
        </label>
        <label>
          Status
          <select name="status" defaultValue={initialValues?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="full">Full</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          What to bring
          <textarea name="what_to_bring" rows={3} defaultValue={initialValues?.what_to_bring ?? ""} />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Weather note
          <textarea name="weather_note" rows={3} defaultValue={initialValues?.weather_note ?? ""} />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Internal notes
          <textarea name="internal_notes" rows={3} defaultValue={initialValues?.internal_notes ?? ""} />
        </label>
        <label>
          <input name="waiver_required" type="checkbox" defaultChecked={initialValues?.waiver_required ?? true} />
          Waiver required
        </label>
      </div>

      <div className="cta-row">
        <button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create class" : "Save changes"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
