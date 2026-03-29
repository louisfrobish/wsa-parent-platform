"use client";

import { useState } from "react";

type CopyFacebookCaptionButtonProps = {
  caption: string;
};

export function CopyFacebookCaptionButton({ caption }: CopyFacebookCaptionButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="button button-ghost"
      onClick={async () => {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(caption);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }
      }}
    >
      {copied ? "Caption copied" : "Copy Facebook Caption"}
    </button>
  );
}
