"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { emptyProgress, type Progress } from "@/lib/progress";

type AuthCtx = { session: Session | null; user: User | null; loading: boolean };
const AuthContext = createContext<AuthCtx>({ session: null, user: null, loading: true });

type ProgressCtx = {
  progress: Progress;
  ready: boolean;
  synced: boolean;
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
};
const ProgressContext = createContext<ProgressCtx | null>(null);

export const useAuth = () => useContext(AuthContext);
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress fuera de ProgressProvider");
  return ctx;
}

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthCtx>({ session: null, user: null, loading: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, user: data.session?.user ?? null, loading: false });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

const localKey = (uid: string) => `psicolingo-progress-${uid}`;

function readLocal(uid: string): (Progress & { _ts?: number }) | null {
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ProgressProvider({ user, children }: { user: User; children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [synced, setSynced] = useState(false);
  const remoteOk = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal(user.id);
      let chosen: Progress = local ?? emptyProgress();
      const { data, error } = await supabase
        .from("progress")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error) {
        remoteOk.current = true;
        const remoteTs = data ? new Date(data.updated_at).getTime() : 0;
        if (data?.data && Object.keys(data.data).length && remoteTs >= (local?._ts ?? 0)) {
          chosen = data.data as Progress;
        }
      }
      if (cancelled) return;
      const merged = { ...emptyProgress(), ...chosen, settings: { ...emptyProgress().settings, ...chosen.settings } };
      setProgress(merged);
      applyTheme(merged.settings.dark);
      setSynced(remoteOk.current);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const persist = useCallback(
    (p: Progress) => {
      const ts = Date.now();
      try {
        localStorage.setItem(localKey(user.id), JSON.stringify({ ...p, _ts: ts }));
      } catch {}
      if (!remoteOk.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const { error } = await supabase
          .from("progress")
          .upsert({ user_id: user.id, data: p, updated_at: new Date(ts).toISOString() });
        setSynced(!error);
      }, 1200);
    },
    [user.id],
  );

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((prev) => {
        const next = fn(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    update((p) => ({ ...emptyProgress(), settings: p.settings }));
  }, [update]);

  return (
    <ProgressContext.Provider value={{ progress, ready, synced, update, reset }}>
      {children}
    </ProgressContext.Provider>
  );
}
