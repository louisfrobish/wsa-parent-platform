import Link from "next/link";
import type { StudentRecord } from "@/lib/students";

type DashboardFamilyCommandSnapshotProps = {
  students: StudentRecord[];
  badgeCounts?: Record<string, number>;
};

function getRankClassName(rank: string) {
  switch (rank.toLowerCase()) {
    case "bronco":
      return "rank-bronco";
    case "mustang":
      return "rank-mustang";
    case "stallion":
      return "rank-stallion";
    default:
      return "rank-colt";
  }
}

export function DashboardFamilyCommandSnapshot({
  students,
  badgeCounts = {}
}: DashboardFamilyCommandSnapshotProps) {
  return (
    <section className="panel stack dashboard-command-snapshot">
      {students.length ? (
        <div className="dashboard-command-students">
          {students.map((student) => {
            const badgeCount = badgeCounts[student.id] ?? 0;
            return (
              <article className="dashboard-command-student" key={student.id}>
                <div className="dashboard-command-student-main">
                  <div className="dashboard-command-student-heading">
                    <h4>{student.name}</h4>
                    <span className="rank-pill dashboard-command-rank">
                      <span
                        className={`rank-emblem rank-emblem-small ${getRankClassName(student.current_rank)}`}
                        aria-hidden="true"
                      />
                      {student.current_rank}
                    </span>
                  </div>
                  <p className="dashboard-command-student-meta">
                    Age {student.age} | {student.completed_adventures_count} completed | {badgeCount} badge{badgeCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Link className="button button-primary dashboard-command-start" href={`/daily-adventure?studentId=${student.id}`}>
                  Start
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="field-empty-state">
          <div className="copy">
            <h4>No students added yet</h4>
            <p className="muted">Add your first student to start tracking adventures, badges, and family planning.</p>
            <div className="cta-row" style={{ marginTop: 12 }}>
              <Link className="button button-primary" href="/students">
                Add first student
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
