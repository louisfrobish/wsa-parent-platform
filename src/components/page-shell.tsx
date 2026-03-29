import { AppShell } from "@/components/app-shell";

type PageShellProps = {
  userLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageShell({ userLabel, eyebrow, title, description, children }: PageShellProps) {
  return (
    <AppShell userLabel={userLabel}>
      <section className="page-header panel">
        <div className="page-header-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="lede">{description}</p>
        </div>
      </section>
      {children}
    </AppShell>
  );
}
