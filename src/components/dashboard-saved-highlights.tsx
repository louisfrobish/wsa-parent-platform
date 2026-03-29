import Link from "next/link";
import { generationKindLabel, getGenerationSummary, type GenerationRecord } from "@/lib/generations";

type DashboardSavedHighlightsProps = {
  items: GenerationRecord[];
};

export function DashboardSavedHighlights({ items }: DashboardSavedHighlightsProps) {
  return (
    <section className="panel stack">
      <div className="header-row">
        <div>
          <p className="eyebrow">Saved highlights</p>
          <h3>Quick revisits</h3>
        </div>
        <Link className="button button-ghost" href="/history">
          Open history
        </Link>
      </div>

      {items.length ? (
        <div className="content-grid">
          {items.map((item) => (
            <article className="panel stack" key={item.id}>
              <span className="pill">{generationKindLabel(item.tool_type)}</span>
              <h4>{item.title}</h4>
              <p className="panel-copy" style={{ margin: 0 }}>
                {getGenerationSummary(item)}
              </p>
              <div className="cta-row">
                <Link className="button button-ghost" href={`/generations/${item.id}`}>
                  View
                </Link>
                <Link className="button button-ghost" href={`/generations/${item.id}?print=1`}>
                  Print
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel-copy">A few high-value saved items will surface here as your library grows.</p>
      )}
    </section>
  );
}
