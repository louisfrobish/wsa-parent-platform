import { createBrowserClient } from "@supabase/ssr";
import type { SupportedStorage } from "@supabase/supabase-js";

export const SESSION_PERSISTENCE_KEY = "wsa-session-persistence";
export const SESSION_PERSISTENCE_VALUES = {
  remembered: "remembered",
  session: "session"
} as const;

type SessionPersistenceMode = (typeof SESSION_PERSISTENCE_VALUES)[keyof typeof SESSION_PERSISTENCE_VALUES];

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getProjectRef() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? "wsa";
  } catch {
    return "wsa";
  }
}

export function getSupabaseStorageKey() {
  return `sb-${getProjectRef()}-auth-token`;
}

export function getSessionPersistenceMode(): SessionPersistenceMode {
  if (typeof window === "undefined") {
    return SESSION_PERSISTENCE_VALUES.remembered;
  }

  const saved = window.localStorage.getItem(SESSION_PERSISTENCE_KEY);
  return saved === SESSION_PERSISTENCE_VALUES.session
    ? SESSION_PERSISTENCE_VALUES.session
    : SESSION_PERSISTENCE_VALUES.remembered;
}

export function setSessionPersistenceMode(rememberDevice: boolean) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    SESSION_PERSISTENCE_KEY,
    rememberDevice ? SESSION_PERSISTENCE_VALUES.remembered : SESSION_PERSISTENCE_VALUES.session
  );
}

function getActiveStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  return getSessionPersistenceMode() === SESSION_PERSISTENCE_VALUES.session
    ? window.sessionStorage
    : window.localStorage;
}

function getInactiveStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  return getSessionPersistenceMode() === SESSION_PERSISTENCE_VALUES.session
    ? window.localStorage
    : window.sessionStorage;
}

function createSessionAwareStorage(): SupportedStorage {
  return {
    getItem(key) {
      const activeStorage = getActiveStorage();
      const inactiveStorage = getInactiveStorage();

      return activeStorage?.getItem(key) ?? inactiveStorage?.getItem(key) ?? null;
    },
    setItem(key, value) {
      const activeStorage = getActiveStorage();
      const inactiveStorage = getInactiveStorage();

      activeStorage?.setItem(key, value);
      inactiveStorage?.removeItem(key);
    },
    removeItem(key) {
      getActiveStorage()?.removeItem(key);
      getInactiveStorage()?.removeItem(key);
    }
  };
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: createSessionAwareStorage(),
        storageKey: getSupabaseStorageKey(),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return browserClient;
}
