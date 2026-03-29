import Link from "next/link";
import { MarkCompleteCard } from "@/components/mark-complete-card";
import { generationKindLabel, getGenerationInput, type GenerationRecord } from "@/lib/generations";

type DashboardRecentActivityProps = {
  items: GenerationRecord[];
  completedGenerationIds?: Set<string>;
};

export function DashboardRecentActivity({ items, completedGenerationIds = new Set() }: DashboardRecentActivityProps) {
  return (
    <section className="panel stack">
      <div className="field-section-header">
        <div>
          <p className="eyebrow">Recent work</p>
          <h3>Useful items to open, print, or finish</h3>
        </div>
      </div>

      {items.length ? (
        <div className="stack">
          {items.map((item) => {
            const input = (getGenerationInput(item) ?? {}) as Record<string, unknown>;
            const studentName = typeof input.studentName === "string" ? input.studentName : "";
            const isCompleted = completedGenerationIds.has(item.id);

            return (
              <article className="note-card badge-specimen" key={item.id}>
                <div className="copy stack">
                  <div className="header-row">
                    <div>
                      <h4>{item.title}</h4>
                      <p className="muted" style={{ margin: "8px 0 0" }}>
                        {generationKindLabel(item.tool_type)} | {new Date(item.created_at).toLocaleDateString()}
                        {studentName ? ` | ${studentName}` : ""}
                      </p>
                    </div>
                    <span className="pill">{isCompleted ? "Completed" : "Open loop"}</span>
                  </div>

                  <div className="cta-row">
                    <Link className="button button-ghost" href={`/generations/${item.id}`}>
                      Open
                    </Link>
                    <Link className="button button-ghost" href={`/generations/${item.id}?print=1`}>
                      Print
                    </Link>
                    {!isCompleted ? (
                      <MarkCompleteCard studentId={item.student_id} generationId={item.id} compact />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="field-empty-state">
          <div className="copy">
            <h4>No recent work yet</h4>
            <p className="panel-copy" style={{ marginBottom: 0 }}>
              Generated adventures, plans, and lessons will appear here with quick actions once the family starts using the tools.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
