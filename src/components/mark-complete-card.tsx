"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActivityCompletionRecord } from "@/lib/activity-completions";
import type { AchievementRecord, BadgeRecord } from "@/lib/badges";
import type { StudentRecord } from "@/lib/students";

type CompletionResponse = {
  completion: ActivityCompletionRecord;
  updatedStudent: StudentRecord;
  newBadges: BadgeRecord[];
  newAchievements: AchievementRecord[];
  recentBadge: BadgeRecord | null;
  rankJustReached: string | null;
};

type MarkCompleteCardProps = {
  studentId?: string | null;
  generationId?: string;
  classBookingId?: string;
  initialCompleted?: boolean;
  compact?: boolean;
  onCompleted?: (payload: CompletionResponse) => void;
};

export function MarkCompleteCard({
  studentId,
  generationId,
  classBookingId,
  initialCompleted = false,
  compact = false,
  onCompleted
}: MarkCompleteCardProps) {
  const [isComplete, setIsComplete] = useState(initialCompleted);
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [parentRating, setParentRating] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const successLabel = useMemo(() => {
    if (!success) return "";
    return success;
  }, [success]);

  if (!studentId) {
    return (
      <div className={compact ? "" : "panel stack"}>
        <p className="panel-copy" style={{ margin: 0 }}>
          Select a student for this activity first, then you can mark it complete and track real progress.
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className={compact ? "" : "panel stack"}>
        <p className="success" style={{ margin: 0 }}>
          Completed and added to this student&apos;s trail.
        </p>
        {successLabel ? (
          <p className="panel-copy" style={{ margin: 0 }}>
            {successLabel}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={compact ? "stack" : "panel stack"}>
      <div className="cta-row">
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setIsOpen((current) => !current);
            setError("");
          }}
        >
          {isOpen ? "Hide completion form" : "Mark complete"}
        </button>
        {!compact ? (
          <p className="panel-copy" style={{ margin: 0 }}>
            Record notes, a quick rating, and trigger badges or rank progress.
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setSuccess("");

            startTransition(async () => {
              const response = await fetch("/api/activity-completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  studentId,
                  generationId,
                  classBookingId,
                  notes,
                  parentRating: parentRating ? Number(parentRating) : undefined
                })
              });

              const payload = (await response.json()) as CompletionResponse | { error: string };

              if (!response.ok || "error" in payload) {
                setError("error" in payload ? payload.error : "Could not save completion.");
                return;
              }

              const rewardParts = [
                payload.rankJustReached ? `${payload.rankJustReached} rank unlocked` : "",
                payload.newBadges.length ? payload.newBadges.map((item) => `${payload.updatedStudent.name} earned ${item.name}`).join(" | ") : "",
                payload.newAchievements.length ? payload.newAchievements.map((item) => item.name).join(" | ") : ""
              ].filter(Boolean);

              setSuccess(rewardParts.length ? rewardParts.join(" | ") : "Completion saved and student progress updated.");
              setIsComplete(true);
              setIsOpen(false);
              onCompleted?.(payload);
              router.refresh();
            });
          }}
        >
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="A quick note about how it went today."
              rows={3}
            />
          </label>
          <label>
            Parent rating
            <select value={parentRating} onChange={(event) => setParentRating(event.target.value)}>
              <option value="">No rating</option>
              <option value="1">1 - Tough day</option>
              <option value="2">2 - Needed support</option>
              <option value="3">3 - Solid</option>
              <option value="4">4 - Strong</option>
              <option value="5">5 - Excellent</option>
            </select>
          </label>
          <div className="cta-row">
            <button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save completion"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="error" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}
      {successLabel && !isComplete ? (
        <p className="success" style={{ margin: 0 }}>
          {successLabel}
        </p>
      ) : null}
    </div>
  );
}
