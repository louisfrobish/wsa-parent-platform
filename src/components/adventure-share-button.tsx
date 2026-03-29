"use client";

import { useState } from "react";
import { getFacebookShareUrl } from "@/lib/social";

type AdventureShareButtonProps = {
  title: string;
  generationId?: string;
};

export function AdventureShareButton({ title, generationId }: AdventureShareButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="button button-ghost"
      onClick={async () => {
        const targetUrl = generationId ? `${window.location.origin}/generations/${generationId}` : window.location.href;

        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: "Take a look at this Wild Stallion Academy adventure.",
              url: targetUrl
            });
            return;
          } catch {
            return;
          }
        }

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(targetUrl);
          setCopied(true);
          window.open(getFacebookShareUrl(targetUrl), "_blank", "noopener,noreferrer");
          window.setTimeout(() => setCopied(false), 1800);
          return;
        }

        window.open(getFacebookShareUrl(targetUrl), "_blank", "noopener,noreferrer");
      }}
    >
      {copied ? "Link copied" : "Share this adventure"}
    </button>
  );
}
