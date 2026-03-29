"use client";

import { useEffect } from "react";
import {
  SESSION_PERSISTENCE_KEY,
  SESSION_PERSISTENCE_VALUES,
  getSupabaseStorageKey
} from "@/lib/supabase/client";

export default function SessionPersistenceBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = getSupabaseStorageKey();
    const persistence =
      window.localStorage.getItem(SESSION_PERSISTENCE_KEY) ??
      SESSION_PERSISTENCE_VALUES.remembered;

    const rememberedValue = window.localStorage.getItem(storageKey);
    const sessionValue = window.sessionStorage.getItem(storageKey);

    if (persistence === SESSION_PERSISTENCE_VALUES.session) {
      if (!sessionValue && rememberedValue) {
        window.sessionStorage.setItem(storageKey, rememberedValue);
      }

      window.localStorage.removeItem(storageKey);
      return;
    }

    if (!rememberedValue && sessionValue) {
      window.localStorage.setItem(storageKey, sessionValue);
    }
  }, []);

  return null;
}
