"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { Splash } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "reset";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos.",
  "Email not confirmed": "Debes confirmar tu correo antes de entrar. Revisa tu bandeja de entrada.",
  "User already registered": "Ese correo ya tiene una cuenta. Inicia sesión.",
};

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/inicio");
  }, [user, loading, router]);

  if (loading || user) return <Splash />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: `${location.origin}/inicio` },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("¡Cuenta creada! Te enviamos un correo para confirmar tu cuenta. Después, inicia sesión.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/perfil`,
        });
        if (error) throw error;
        setInfo("Si el correo existe, recibirás un enlace para restablecer tu contraseña.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(ERRORS[msg] ?? msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="hidden flex-col items-center gap-4 text-center md:flex">
          <div className="text-[9rem] leading-none drop-shadow">🧠</div>
          <h1 className="text-5xl font-black text-brand">PsicoLingo</h1>
          <p className="muted max-w-sm text-lg font-bold">
            Semiología y psicopatología en lecciones cortas, casos clínicos y retos diarios.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <span className="chip">📚 12 unidades</span>
            <span className="chip">🩺 150 casos</span>
            <span className="chip">🔥 Rachas diarias</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-1 md:hidden">
            <div className="text-6xl">🧠</div>
            <h1 className="text-3xl font-black text-brand">PsicoLingo</h1>
          </div>

          <h2 className="mb-5 text-center text-2xl font-black">
            {mode === "login" ? "Inicia sesión" : mode === "signup" ? "Crea tu perfil" : "Recuperar contraseña"}
          </h2>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input className="input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            )}
            <input
              className="input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {mode !== "reset" && (
              <input
                className="input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            )}

            {error && <p className="animate-shake rounded-xl bg-danger/10 p-3 text-sm font-bold text-danger">{error}</p>}
            {info && <p className="rounded-xl bg-brand/10 p-3 text-sm font-bold text-brand-dark dark:text-brand">{info}</p>}

            <button className="btn btn-sky mt-1 w-full" disabled={busy}>
              {busy ? "Un momento…" : mode === "login" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Enviar enlace"}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-3 text-sm font-extrabold">
            {mode === "login" && (
              <button className="text-sky uppercase tracking-wide" onClick={() => { setMode("reset"); setError(null); setInfo(null); }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <div className="h-0.5 w-full bg-[var(--line)]" />
            {mode === "login" ? (
              <button className="btn btn-ghost w-full" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>
                Crear una cuenta
              </button>
            ) : (
              <button className="btn btn-ghost w-full" onClick={() => { setMode("login"); setError(null); }}>
                Ya tengo cuenta
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
