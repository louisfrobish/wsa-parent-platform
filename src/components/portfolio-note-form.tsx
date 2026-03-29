"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PortfolioNoteFormProps = {
  studentId: string;
};

export function PortfolioNoteForm({ studentId }: PortfolioNoteFormProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        startTransition(async () => {
          const response = await fetch("/api/portfolio-notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              studentId,
              note
            })
          });

          const payload = (await response.json()) as { note?: { id: string }; error?: string };

          if (!response.ok || payload.error) {
            setError(payload.error ?? "Could not save note.");
            return;
          }

          setNote("");
          setSuccess("Portfolio note added.");
          router.refresh();
        });
      }}
    >
      <label>
        Parent reflection
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What went well, what surprised your child, or skills practiced today."
          rows={4}
          required
        />
      </label>
      <div className="cta-row">
        <button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add note"}
        </button>
      </div>
      {error ? <p className="error" style={{ margin: 0 }}>{error}</p> : null}
      {success ? <p className="success" style={{ margin: 0 }}>{success}</p> : null}
    </form>
  );
}
