import type { ReactNode } from "react";

type WSALetterheadProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  showHeaderImage?: boolean;
};

export function WSALetterhead({
  title = "Daily Adventure",
  subtitle = "Southern Maryland Outdoor Learning",
  children,
  className = "",
  showHeaderImage = false,
}: WSALetterheadProps) {
  return (
    <section className={`wsa-letterhead ${className}`.trim()}>
      <header
        className={`wsa-letterhead-header ${showHeaderImage ? "" : "wsa-letterhead-header-no-image"}`.trim()}
      >
        {showHeaderImage ? (
          <img
            className="wsa-letterhead-image"
            src="/wsa-header.png"
            alt="Wild Stallion Academy header"
          />
        ) : null}
        <div className="wsa-letterhead-copy">
          <p className="wsa-letterhead-title">{title}</p>
          <p className="wsa-letterhead-subtitle">{subtitle}</p>
        </div>
      </header>

      <div className="wsa-letterhead-body">{children}</div>

      <footer className="wsa-letterhead-footer">Wild Stallion Academy</footer>
    </section>
  );
}
