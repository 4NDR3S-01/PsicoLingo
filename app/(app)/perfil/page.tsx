"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyTheme, useAuth, useProgress } from "@/components/providers";
import { PageHeader } from "@/components/ui";
import { ACHIEVEMENTS, currentStreak, level, type Progress } from "@/lib/progress";
import { supabase } from "@/lib/supabase";

const AVATARS = ["🧠", "🦉", "🐱", "🐶", "🦊", "🐼", "🐸", "🦁", "🐧", "🦄", "👩‍⚕️", "👨‍⚕️", "🧑‍🎓", "🌻", "🚀", "🌙"];
const GOALS = [
  { xp: 20, label: "Relajada" },
  { xp: 50, label: "Normal" },
  { xp: 100, label: "Seria" },
  { xp: 150, label: "Intensa" },
];

function Toggle({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-center gap-3 py-3 text-left" role="switch" aria-checked={on}>
      <div className="flex-1">
        <p className="font-black">{label}</p>
        <p className="muted text-sm font-semibold">{desc}</p>
      </div>
      <span className={`relative h-8 w-14 rounded-full transition ${on ? "bg-brand" : "bg-[var(--line)]"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </span>
    </button>
  );
}

export default function Perfil() {
  const { user } = useAuth();
  const { progress, update, reset, synced } = useProgress();
  const router = useRouter();
  const [name, setName] = useState((user?.user_metadata?.name as string) ?? "");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const setSettings = (s: Partial<Progress["settings"]>) => update((p) => ({ ...p, settings: { ...p.settings, ...s } }));
  const badges = ACHIEVEMENTS.filter((a) => a.ok(progress));

  async function saveName() {
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Nombre actualizado." });
  }

  async function savePassword() {
    if (pwd.length < 6) return setMsg({ ok: false, text: "La contraseña debe tener al menos 6 caracteres." });
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwd("");
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Contraseña actualizada." });
  }

  async function logout() {
    await supabase.auth.signOut();
    applyTheme(false);
    router.replace("/login");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="👤 Perfil" />

      <section className="card mb-6 flex flex-col items-center gap-4 p-6 md:flex-row">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-dashed border-sky/50 bg-sky/10 text-6xl">
          {progress.settings.avatar}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black">{(user?.user_metadata?.name as string) || "Estudiante"}</h2>
          <p className="muted font-semibold">{user?.email}</p>
          <p className="muted text-sm font-semibold">
            Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString("es", { month: "long", year: "numeric" }) : "—"}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="chip text-flame">🔥 {currentStreak(progress)} días</span>
            <span className="chip text-gold">⭐ {progress.xp} XP</span>
            <span className="chip text-sky">🏅 Nivel {level(progress.xp)}</span>
            <span className="chip" title={synced ? "Progreso sincronizado con la nube" : "Progreso guardado solo en este dispositivo"}>
              {synced ? "☁️ Sincronizado" : "💾 Local"}
            </span>
          </div>
        </div>
      </section>

      <section className="card mb-6 p-5">
        <h3 className="mb-3 font-black">Avatar</h3>
        <div className="grid grid-cols-8 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setSettings({ avatar: a })}
              className={`flex aspect-square items-center justify-center rounded-xl border-2 text-2xl transition md:text-3xl ${
                progress.settings.avatar === a ? "border-sky bg-sky/10" : "border-[var(--line)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="card mb-6 p-5">
        <h3 className="mb-3 font-black">🏅 Insignias ({badges.length})</h3>
        {badges.length === 0 ? (
          <p className="muted font-semibold">Completa actividades para desbloquear insignias.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b.id} className="chip bg-gold/15 !py-1.5 text-sm" title={b.desc}>
                {b.emoji} {b.title}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="card mb-6 px-5 py-2">
        <h3 className="pt-3 font-black">Configuración</h3>
        <div className="divide-y-2 divide-[var(--line)]">
          <Toggle
            on={progress.settings.dark}
            onChange={(v) => {
              setSettings({ dark: v });
              applyTheme(v);
            }}
            label="🌙 Modo oscuro"
            desc="Cambia el tema de la aplicación."
          />
          <Toggle on={progress.settings.sound} onChange={(v) => setSettings({ sound: v })} label="🔊 Efectos de sonido" desc="Sonidos al acertar o fallar." />
          <div className="py-3">
            <p className="font-black">🎯 Meta diaria</p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {GOALS.map((g) => (
                <button
                  key={g.xp}
                  onClick={() => update((p) => ({ ...p, dailyGoal: g.xp }))}
                  className={`rounded-xl border-2 border-b-4 p-2 text-sm font-extrabold ${progress.dailyGoal === g.xp ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)]"}`}
                >
                  {g.label}
                  <span className="block text-xs opacity-70">{g.xp} XP/día</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card mb-6 flex flex-col gap-4 p-5">
        <h3 className="font-black">Cuenta</h3>
        <div className="flex flex-col gap-2 md:flex-row">
          <input className="input" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-sky md:w-44" onClick={saveName}>
            Guardar nombre
          </button>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input className="input" type="password" placeholder="Nueva contraseña" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
          <button className="btn btn-sky md:w-44" onClick={savePassword}>
            Cambiar
          </button>
        </div>
        {msg && <p className={`rounded-xl p-3 text-sm font-bold ${msg.ok ? "bg-brand/10 text-brand" : "bg-danger/10 text-danger"}`}>{msg.text}</p>}
      </section>

      <section className="flex flex-col gap-3 md:flex-row">
        {confirmReset ? (
          <div className="card flex flex-1 flex-col gap-2 border-danger/50 p-4">
            <p className="font-bold">¿Seguro? Se borrará todo tu progreso (XP, racha, casos, repasos).</p>
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-danger flex-1"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost flex-1 !text-danger" onClick={() => setConfirmReset(true)}>
            Reiniciar progreso
          </button>
        )}
        <button className="btn btn-danger flex-1" onClick={logout}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
