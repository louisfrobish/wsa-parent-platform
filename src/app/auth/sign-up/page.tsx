"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <main className="shell">
      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h2>Start your WSA family portal</h2>
        <p className="panel-copy">
          Parents create a secure account through Supabase Auth. Email confirmation can be enabled in production.
        </p>

        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            const form = event.currentTarget;
            const formData = new FormData(form);

            startTransition(async () => {
              const supabase = createClient();
              const email = String(formData.get("email") || "");
              const password = String(formData.get("password") || "");
              const fullName = String(formData.get("fullName") || "");
              const householdName = String(formData.get("householdName") || "");

              const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  emailRedirectTo: `${window.location.origin}/dashboard`,
                  data: {
                    full_name: fullName,
                    household_name: householdName
                  }
                }
              });

              if (signUpError) {
                setError(signUpError.message);
                return;
              }

              setMessage("Account created. Check your email to confirm the sign-in link if confirmations are enabled.");
              form.reset();
            });
          }}
        >
          <label>
            Full name
            <input name="fullName" required />
          </label>
          <label>
            Household name
            <input name="householdName" placeholder="Smith family" />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={10} required />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </button>
          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </form>

        <p className="muted">
          Already have an account? <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
