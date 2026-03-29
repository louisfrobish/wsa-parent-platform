import Link from "next/link";
import { generationKindLabel, getGenerationSummary, type GenerationRecord } from "@/lib/generations";

type HistoryListProps = {
  items: GenerationRecord[];
  emptyMessage: string;
};

export function HistoryList({ items, emptyMessage }: HistoryListProps) {
  if (!items.length) {
    return (
      <article className="panel">
        <p className="panel-copy">{emptyMessage}</p>
      </article>
    );
  }

  return (
    <section className="content-grid">
      {items.map((item) => (
        <article className="panel stack" key={item.id}>
          <div className="header-row">
            <span className="pill">{generationKindLabel(item.tool_type)}</span>
            <span className="muted">{new Date(item.created_at).toLocaleString()}</span>
          </div>
          <h3 style={{ margin: 0 }}>{item.title}</h3>
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
    </section>
  );
}
