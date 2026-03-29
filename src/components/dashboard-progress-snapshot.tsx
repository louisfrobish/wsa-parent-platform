type DashboardProgressSnapshotProps = {
  totalCompletedAdventures: number;
  totalSavedLessons: number;
  topStudentRank: string;
  recentBadgeEarned: string;
  printableItemsCreated: number;
};

function CampfireIcon() {
  return (
    <svg aria-hidden="true" className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4c2 3.5 3.5 5.7 3.5 8.5A3.5 3.5 0 1 1 8.5 13c0-1.9 1-3.8 3.5-9Z" />
      <path d="M4 20h16" />
      <path d="M7 17l-2 3" />
      <path d="M17 17l2 3" />
    </svg>
  );
}

export function DashboardProgressSnapshot(props: DashboardProgressSnapshotProps) {
  const items = [
    { label: "Completed adventures", value: String(props.totalCompletedAdventures) },
    { label: "Saved lessons", value: String(props.totalSavedLessons) },
    { label: "Top student rank", value: props.topStudentRank },
    { label: "Recent badge", value: props.recentBadgeEarned },
    { label: "Printable items", value: String(props.printableItemsCreated) }
  ];

  return (
    <section className="panel stack dashboard-progress-panel">
      <div className="field-section-header">
        <div className="field-section-heading">
          <span className="field-guide-icon-disc">
            <CampfireIcon />
          </span>
          <div>
            <p className="eyebrow">Progress snapshot</p>
            <h3>Family momentum</h3>
          </div>
        </div>
      </div>
      <div className="dashboard-stats-five">
        {items.map((item) => (
          <article className="stat metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
