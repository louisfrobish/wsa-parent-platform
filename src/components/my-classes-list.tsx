import Link from "next/link";
import { MarkCompleteCard } from "@/components/mark-complete-card";
import type { ActivityCompletionRecord } from "@/lib/activity-completions";
import type { ClassBookingRecord, ClassRecord } from "@/lib/classes";

type MyClassesListItem = ClassBookingRecord & {
  studentName: string;
  classes?: ClassRecord | null;
};

type MyClassesListProps = {
  items: MyClassesListItem[];
  completions: ActivityCompletionRecord[];
  successMessage?: string;
};

function formatPrice(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amountCents / 100);
}

export function MyClassesList({ items, completions, successMessage }: MyClassesListProps) {
  const completedBookingIds = new Set(completions.map((item) => item.class_booking_id).filter(Boolean));

  return (
    <section className="stack">
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {items.length ? (
        <div className="content-grid">
          {items.map((item) => (
            <article className="panel stack" key={item.id}>
              <div className="header-row">
                <div>
                  <p className="eyebrow">{item.classes?.class_type ?? "Class booking"}</p>
                  <h3>{item.classes?.title ?? "Booked class"}</h3>
                </div>
                <span className="pill">{item.payment_status}</span>
              </div>

              <p className="panel-copy" style={{ margin: 0 }}>
                {item.studentName} • {item.classes?.date ? new Date(item.classes.date).toLocaleDateString() : new Date(item.booked_at).toLocaleDateString()}
                {item.classes?.location ? ` • ${item.classes.location}` : ""}
              </p>

              <div className="chip-list">
                <li>{item.booking_status}</li>
                <li>{formatPrice(item.amount_paid_cents)}</li>
              </div>

              <div className="cta-row">
                {item.classes ? (
                  <Link className="button button-ghost" href={`/classes/${item.classes.id}`}>
                    View class
                  </Link>
                ) : null}
                {item.payment_status === "paid" ? (
                  <MarkCompleteCard
                    studentId={item.student_id}
                    classBookingId={item.id}
                    compact
                    initialCompleted={completedBookingIds.has(item.id)}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="panel stack">
          <div>
            <p className="eyebrow">My classes</p>
            <h3>No class bookings yet</h3>
            <p className="panel-copy">Browse upcoming field-based classes, book a spot for a student, and they will appear here automatically.</p>
          </div>
          <div className="cta-row">
            <Link className="button button-primary" href="/classes">
              Browse classes
            </Link>
          </div>
        </section>
      )}
    </section>
  );
}
