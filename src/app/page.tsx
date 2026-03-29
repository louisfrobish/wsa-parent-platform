import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/wsa-login-bg.jpg')" }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(20,28,24,0.45)" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(245,235,214,0.10), rgba(20,28,24,0.35))",
        }}
      />

      {/* Login card */}
      <section
        className="auth-card relative z-10"
        style={{
          width: "min(100%, 460px)",
          backdropFilter: "blur(2px)",
        }}
      >
        <p className="eyebrow">Wild Stallion Academy</p>

        <div className="wood-banner wood-banner-small">Parent Portal</div>

        <h1
          className="page-title"
          style={{
            margin: 0,
            fontSize: "clamp(3rem, 6vw, 5rem)",
            lineHeight: 0.92,
            color: "#2f2417",
            textShadow: "0 2px 0 rgba(0,0,0,0.28)",
          }}
        >
          Wild Stallion
          <br />
          Academy
        </h1>

        <p className="panel-copy" style={{ margin: 0 }}>
          Sign in to access your family dashboard, planner, badges, and Wild
          Stallion Academy tools.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
