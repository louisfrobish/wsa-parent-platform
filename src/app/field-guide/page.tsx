import Link from "next/link";

const guidePages = [
  { title: "Frogs of Southern Maryland", image: "/field-guide/frogs.png", tag: "Amphibians" },
  { title: "Simple Wilderness Shelters", image: "/field-guide/shelters.png", tag: "Bushcraft" },
  { title: "Essential Rope Knots", image: "/field-guide/knots.png", tag: "Skill Builder" },
  { title: "Mammals of Southern Maryland", image: "/field-guide/mammals.png", tag: "Mammals" },
  { title: "Mammal Tracks", image: "/field-guide/large-mammal-tracks.png", tag: "Tracking" },
  { title: "Predator & Small Mammal Tracks", image: "/field-guide/small-mammal-tracks.png", tag: "Tracking" },
  { title: "Dragonfly Life Cycle", image: "/field-guide/dragonfly-lifecycle.png", tag: "Life Cycles" },
  { title: "Turtles of Southern Maryland", image: "/field-guide/turtles.png", tag: "Reptiles" },
  { title: "Stream Fish", image: "/field-guide/stream-fish.png", tag: "Fish" },
  { title: "Big Fish of Southern Maryland Waters", image: "/field-guide/big-fish.png", tag: "Fish" },
  { title: "Birds by Season", image: "/field-guide/birds.png", tag: "Birds" },
  { title: "Forest Trees", image: "/field-guide/forest-trees.png", tag: "Trees" },
  { title: "Leaf & Bark Identification", image: "/field-guide/leaf-and-bark-id.png", tag: "Trees" },
  { title: "Maryland State Symbols", image: "/field-guide/maryland-state-symbols.png", tag: "Plants" },
  { title: "Mushrooms of Maryland", image: "/field-guide/mushrooms.png", tag: "Fungi" },
  { title: "Fire Building", image: "/field-guide/fire-starting.png", tag: "Survival Basics" },
  { title: "Finding & Filtering Water", image: "/field-guide/water-filtration.png", tag: "Survival Basics" },
  { title: "Butterflies of Southern Maryland", image: "/field-guide/butterflies.png", tag: "Insects" },
  { title: "Dragonflies of Southern Maryland", image: "/field-guide/dragonflies.png", tag: "Insects" }
];

export default function FieldGuidePage() {
  return (
    <main className="shell field-guide-shell">
      <section className="top-nav">
        <span className="crest-mark">WSA Field Guide</span>
        <div className="nav-actions">
          <Link className="button button-ghost" href="/">
            Home
          </Link>
          <Link className="button button-primary" href="/dashboard">
            Parent dashboard
          </Link>
        </div>
      </section>

      <section className="hero guide-hero">
        <div>
          <p className="eyebrow">Wild Stallion Academy</p>
          <div className="wood-banner">Illustrated Explorer Boards</div>
          <h1 className="display">A visual field guide built from your WSA handbook art.</h1>
          <p className="lede">
            This gallery brings your illustrated boards into the app so families can browse animals, plants, tracks,
            safety skills, and outdoor learning topics in one place.
          </p>
        </div>
        <div className="guide-hero-card">
          <p className="eyebrow">Included topics</p>
          <ul className="chip-list">
            <li>Frogs</li>
            <li>Birds</li>
            <li>Trees</li>
            <li>Mammals</li>
            <li>Fish</li>
            <li>Shelters</li>
            <li>Knots</li>
            <li>Water safety</li>
          </ul>
        </div>
      </section>

      <section className="field-guide-grid">
        {guidePages.map((page) => (
          <article className="field-guide-card" key={page.title}>
            <div className="field-guide-meta">
              <span className="pill">{page.tag}</span>
            </div>
            <img src={page.image} alt={page.title} className="field-guide-image" />
            <div className="field-guide-copy">
              <div className="wood-banner wood-banner-small">{page.title}</div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
