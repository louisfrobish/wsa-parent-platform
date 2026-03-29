"use client";

import { useState, useTransition } from "react";
import { StudentCard } from "@/components/student-card";
import type { StudentRecord } from "@/lib/students";

type StudentsManagerProps = {
  initialStudents: StudentRecord[];
};

type CreateStudentResponse = {
  student: StudentRecord;
};

export function StudentsManager({ initialStudents }: StudentsManagerProps) {
  const [students, setStudents] = useState(initialStudents);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <section className="content-grid">
      <article className="panel stack">
        <div>
          <p className="eyebrow">Add student</p>
          <h3>Create a new trail companion</h3>
          <p className="panel-copy">Add each child once so daily adventures and rank progress can stay connected to the right learner.</p>
        </div>

        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const form = event.currentTarget;
            const formData = new FormData(form);

            startTransition(async () => {
              const response = await fetch("/api/students", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: String(formData.get("name") || ""),
                  age: Number(formData.get("age") || 8),
                  interests: String(formData.get("interests") || "")
                })
              });

              const payload = (await response.json()) as CreateStudentResponse | { error: string };
              if (!response.ok || "error" in payload) {
                setError("error" in payload ? payload.error : "Unable to create student.");
                return;
              }

              setStudents((current) => [payload.student, ...current]);
              form.reset();
            });
          }}
        >
          <label>
            Name
            <input name="name" placeholder="Avery" required />
          </label>
          <label>
            Age
            <input name="age" type="number" min={3} max={18} defaultValue={8} required />
          </label>
          <label>
            Interests
            <input name="interests" placeholder="birds, drawing, bugs, hiking" />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create student"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </article>

      <article className="panel stack">
        <div>
          <p className="eyebrow">Student roster</p>
          <h3>{students.length ? "Open a student profile" : "No students added yet"}</h3>
          <p className="panel-copy">
            {students.length
              ? "Each profile is the proud student-facing record for rank, badges, creature logs, and homeschool review."
              : "Add your first child profile to start connecting daily adventures to progress."}
          </p>
        </div>

        {students.length ? (
          <div className="content-grid">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
