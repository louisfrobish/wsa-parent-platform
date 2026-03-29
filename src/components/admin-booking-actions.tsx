"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminBookingActionsProps = {
  bookingId: string;
  disabled?: boolean;
};

export function AdminBookingActions({ bookingId, disabled = false }: AdminBookingActionsProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const runAction = (action: "mark_attended" | "mark_no_show" | "cancel_booking" | "mark_refunded") => {
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok || payload.error) {
        setError(payload.error ?? "Could not update booking.");
        return;
      }

      setNotes("");
      router.refresh();
    });
  };

  return (
    <div className="stack">
      <label>
        Internal note
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Optional staff note" />
      </label>
      <div className="cta-row">
        <button type="button" className="button button-primary" disabled={isPending || disabled} onClick={() => runAction("mark_attended")}>
          Mark attended
        </button>
        <button type="button" className="button button-ghost" disabled={isPending} onClick={() => runAction("mark_no_show")}>
          No-show
        </button>
        <button type="button" className="button button-ghost" disabled={isPending} onClick={() => runAction("cancel_booking")}>
          Cancel
        </button>
        <button type="button" className="button button-ghost" disabled={isPending} onClick={() => runAction("mark_refunded")}>
          Refund
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
