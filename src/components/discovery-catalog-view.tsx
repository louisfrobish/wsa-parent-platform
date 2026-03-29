import Link from "next/link";
import { getDiscoveryCategoryLabel, type DiscoveryCatalogCategory, type DiscoveryRecord } from "@/lib/discoveries";

type DiscoveryCatalogViewProps = {
  items: DiscoveryRecord[];
  selectedCategory: DiscoveryCatalogCategory | "all";
  studentNames: Map<string, string>;
};

export function DiscoveryCatalogView({ items, selectedCategory, studentNames }: DiscoveryCatalogViewProps) {
  const categories: Array<DiscoveryCatalogCategory | "all"> = ["all", "animals", "bugs", "trees", "birds", "fish", "plants", "mushrooms"];
  const filtered = selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory);
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="stack">
      <div className="split-grid">
        <article className="panel stack">
          <p className="eyebrow">Family Catalog</p>
          <h3>{items.length} saved discoveries</h3>
          <p className="panel-copy" style={{ marginBottom: 0 }}>
            Track what this family has identified across birds, fish, plants, trees, bugs, animals, and mushrooms. This same catalog supports the household creature log and student-facing creature records.
          </p>
          <div className="cta-row">
            <Link className="button button-ghost" href="/students">
              Open student profiles
            </Link>
            <Link className="button button-ghost" href="/planner">
              Back to weekly planner
            </Link>
          </div>
        </article>
        <article className="panel stack">
          <p className="eyebrow">Category totals</p>
          <div className="chip-list">
            {categories
              .filter((category) => category !== "all")
              .map((category) => (
                <li key={category}>
                  {getDiscoveryCategoryLabel(category)}: {counts[category] ?? 0}
                </li>
              ))}
          </div>
        </article>
      </div>

      <section className="panel stack">
        <div className="student-switcher">
          {categories.map((category) => (
            <Link
              key={category}
              className={`student-switcher-pill ${selectedCategory === category ? "student-switcher-pill-active" : ""}`}
              href={category === "all" ? "/discover/catalog" : `/discover/catalog?category=${category}`}
            >
              {category === "all" ? "All" : getDiscoveryCategoryLabel(category)}
            </Link>
          ))}
        </div>
      </section>

      {filtered.length ? (
        <section className="gallery-grid">
          {filtered.map((item) => (
            <article className="specimen-card" key={item.id}>
              <img src={item.image_url} alt={item.image_alt ?? item.common_name} className="field-guide-image" />
              <div className="field-guide-copy stack">
                <div className="field-guide-meta-row">
                  <span className="badge">{getDiscoveryCategoryLabel(item.category)}</span>
                  <span className="muted">{new Date(item.observed_at).toLocaleDateString()}</span>
                </div>
                <h3 style={{ margin: 0 }}>{item.common_name}</h3>
                {item.scientific_name ? (
                  <p className="muted" style={{ margin: 0 }}>
                    {item.scientific_name}
                  </p>
                ) : null}
                <div className="chip-list discovery-card-meta">
                  <li>{item.student_id ? studentNames.get(item.student_id) ?? "Student linked" : "Household discovery"}</li>
                  <li>{item.confidence_level}</li>
                </div>
                <div className="cta-row">
                  <Link className="button button-ghost" href={`/discover/catalog/${item.id}`}>
                    Open
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="field-empty-state">
          <div className="copy">
            <h4>No discoveries in this category yet</h4>
            <p className="panel-copy" style={{ marginBottom: 0 }}>
              Save a few observations from Discover and this family field notebook will start filling in.
            </p>
          </div>
        </section>
      )}
    </section>
  );
}
