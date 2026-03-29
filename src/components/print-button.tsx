"use client";

import { useEffect } from "react";

type PrintButtonProps = {
  autoPrint?: boolean;
  label?: string;
};

export function PrintButton({ autoPrint = false, label = "Print" }: PrintButtonProps) {
  useEffect(() => {
    if (autoPrint) {
      window.print();
    }
  }, [autoPrint]);

  return (
    <button type="button" className="button button-ghost print-hide" onClick={() => window.print()}>
      {label}
    </button>
  );
}
