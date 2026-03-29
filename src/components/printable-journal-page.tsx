import { WSALetterhead } from "@/components/wsa-letterhead";

type PrintableJournalPageProps = {
  studentName?: string;
  title: string;
};

export function PrintableJournalPage({ studentName, title }: PrintableJournalPageProps) {
  return (
    <WSALetterhead className="print-sheet page-break" title={title}>
      <div className="print-sheet-header">
        <div>
          <p className="print-kicker">Student journal page</p>
          <h2>{title}</h2>
        </div>
        <div className="print-meta">
          <span>Student: {studentName ?? "________________"}</span>
          <span>Date: __________________</span>
        </div>
      </div>

      <div className="print-lines">
        <div>
          <h3>What I observed</h3>
          <div className="journal-lines" />
        </div>
        <div>
          <h3>What I learned</h3>
          <div className="journal-lines" />
        </div>
        <div>
          <h3>What surprised me</h3>
          <div className="journal-lines" />
        </div>
      </div>

      <div className="print-grid-two">
        <section>
          <h3>Sketch box</h3>
          <div className="sketch-box" />
        </section>
        <section>
          <h3>Challenge completion</h3>
          <label className="checkbox-row">
            <input type="checkbox" />
            I completed today&apos;s challenge
          </label>
        </section>
      </div>
    </WSALetterhead>
  );
}
