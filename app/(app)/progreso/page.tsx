"use client";

import Link from "next/link";
import { useProgress } from "@/components/providers";
import { Bar, PageHeader, Stat } from "@/components/ui";
import { CASES } from "@/lib/data/cases";
import {
  ACHIEVEMENTS,
  addDays,
  currentStreak,
  level,
  masteredCount,
  overallProgress,
  today,
  unitAccuracy,
  weakTerms,
} from "@/lib/progress";

const KIND_ICON: Record<string, string> = {
  quiz: "✅",
  caso: "🩺",
  flashcards: "🃏",
  emparejar: "🧩",
  test: "✅",
  sintomas: "🔎",
  examen: "📝",
  repaso: "🔄",
};

export default function Progreso() {
  const { progress } = useProgress();
  const solved = Object.values(progress.cases).filter((c) => c.ok).length;
  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
  const maxXp = Math.max(20, ...days.map((d) => progress.activity[d] ?? 0));
  const heat = Array.from({ length: 84 }, (_, i) => addDays(today(), i - 83));
  const acc = unitAccuracy(progress);
  const weakUnits = acc.filter((a) => a.acc !== null && a.c + a.w >= 3).sort((a, b) => a.acc! - b.acc!).slice(0, 3);
  const weak = weakTerms(progress);
  const unlocked = ACHIEVEMENTS.filter((a) => a.ok(progress)).length;

  return (
    <div>
      <PageHeader title="📊 Mi progreso" subtitle={`Nivel ${level(progress.xp)} · ${overallProgress(progress)}% del temario`} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat icon="⭐" value={progress.xp} label="XP total" color="var(--color-gold)" />
        <Stat icon="🔥" value={currentStreak(progress)} label="racha actual" color="var(--color-flame)" />
        <Stat icon="🏆" value={progress.bestStreak} label="mejor racha" color="var(--color-flame)" />
        <Stat icon="🩺" value={`${solved}/${CASES.length}`} label="casos resueltos" color="var(--color-danger)" />
        <Stat icon="👑" value={masteredCount(progress)} label="términos dominados" color="var(--color-brand)" />
        <Stat icon="📝" value={progress.exams.length} label="exámenes" color="var(--color-sky)" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-4">
          <h3 className="mb-4 font-black">XP de los últimos 14 días</h3>
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Gráfico de XP diario">
            {days.map((d) => {
              const xp = progress.activity[d] ?? 0;
              return (
                <div key={d} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-t-md bg-gold transition-all group-hover:brightness-110"
                    style={{ height: `${(xp / maxXp) * 100}%`, minHeight: xp ? 4 : 2, opacity: xp ? 1 : 0.25 }}
                  />
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--ink)] px-1.5 py-0.5 text-[10px] font-black text-[var(--bg)] group-hover:block">
                    {xp} XP
                  </span>
                </div>
              );
            })}
          </div>
          <div className="muted mt-2 flex justify-between text-[10px] font-bold">
            <span>{days[0].slice(5)}</span>
            <span>Hoy</span>
          </div>
        </section>

        <section className="card p-4">
          <h3 className="mb-4 font-black">Actividad (12 semanas)</h3>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {heat.map((d) => {
              const xp = progress.activity[d] ?? 0;
              const o = xp === 0 ? 0 : xp < 30 ? 0.35 : xp < 80 ? 0.65 : 1;
              return (
                <div
                  key={d}
                  title={`${d}: ${xp} XP`}
                  className="aspect-square rounded-[3px]"
                  style={{ background: xp ? `rgba(88,204,2,${o})` : "var(--line)" }}
                />
              );
            })}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-4">
        <h3 className="mb-4 font-black">Precisión por unidad</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {acc.map(({ unit, acc: a, c, w }) => (
            <Link key={unit.id} href={`/unidades/${unit.id}`} className="flex items-center gap-3">
              <span className="w-6 text-center text-lg">{unit.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className="truncate">{unit.short}</span>
                  <span className="muted">{a === null ? "—" : `${a}% · ${c + w} resp.`}</span>
                </div>
                <Bar value={a ?? 0} color={unit.color} className="!h-2.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-4">
          <h3 className="mb-3 font-black">🎯 Temas débiles</h3>
          {weak.length === 0 ? (
            <p className="muted font-semibold">Aún no hay suficientes datos. ¡Sigue practicando!</p>
          ) : (
            <>
              {weakUnits.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {weakUnits.map((u) => (
                    <Link key={u.unit.id} href={`/unidades/${u.unit.id}`} className="chip text-danger">
                      {u.unit.emoji} {u.unit.short} · {u.acc}%
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2">
                {weak.map(({ t, s }) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
                    <span className="font-bold">{t.term}</span>
                    <span className="font-black">
                      <span className="text-brand">✓{s!.c}</span> <span className="text-danger">✗{s!.w}</span>
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/repaso" className="btn btn-sky mt-3 w-full">
                Repasar ahora
              </Link>
            </>
          )}
        </section>

        <section className="card p-4">
          <h3 className="mb-3 font-black">
            🏅 Logros <span className="muted text-sm">({unlocked}/{ACHIEVEMENTS.length})</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {ACHIEVEMENTS.map((a) => {
              const ok = a.ok(progress);
              return (
                <div key={a.id} title={a.desc} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ${ok ? "bg-gold/15" : "opacity-40 grayscale"}`}>
                  <span className="text-3xl">{a.emoji}</span>
                  <span className="text-[11px] font-black leading-tight">{a.title}</span>
                  <span className="muted text-[10px] font-semibold leading-tight">{a.desc}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-4">
        <h3 className="mb-3 font-black">🕘 Historial</h3>
        {progress.history.length === 0 ? (
          <p className="muted font-semibold">Todavía no has completado ninguna actividad.</p>
        ) : (
          <div className="flex flex-col divide-y-2 divide-[var(--line)]">
            {progress.history.slice(0, 30).map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl">{KIND_ICON[h.kind] ?? "•"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{h.title}</p>
                  <p className="muted text-xs font-semibold">{new Date(h.at).toLocaleString("es")}</p>
                </div>
                <span className="text-sm font-black">
                  {h.score}/{h.total}
                </span>
                <span className="w-14 text-right text-sm font-black text-gold">+{h.xp}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
