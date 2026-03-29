import Link from "next/link";
import { StudentCard } from "@/components/student-card";
import type { StudentRecord } from "@/lib/students";

type DashboardStudentOverviewProps = {
  students: StudentRecord[];
  badgeCounts?: Record<string, number>;
};

function TrailMarkerIcon() {
  return (
    <svg aria-hidden="true" className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l7 7-7 7-7-7 7-7Z" />
      <path d="M12 17v4" />
    </svg>
  );
}

export function DashboardStudentOverview({ students, badgeCounts = {} }: DashboardStudentOverviewProps) {
  return (
    <section className="panel stack dashboard-student-panel">
      <div className="header-row field-section-header">
        <div className="field-section-heading">
          <span className="field-guide-icon-disc">
            <TrailMarkerIcon />
          </span>
          <div>
            <p className="eyebrow">Explorer records</p>
            <h3>Student progress at a glance</h3>
          </div>
        </div>
        <Link className="button button-ghost" href="/students">
          Manage students
        </Link>
      </div>

      {students.length ? (
        <div className="content-grid">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} badgeCount={badgeCounts[student.id] ?? 0} />
          ))}
        </div>
      ) : (
        <div className="field-empty-state">
          <div className="copy">
            <h4>No students added yet</h4>
            <p className="muted">Add the first student to start tracking ranks, fieldwork, and badges from one calm family briefing.</p>
            <div className="cta-row" style={{ marginTop: 14 }}>
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
