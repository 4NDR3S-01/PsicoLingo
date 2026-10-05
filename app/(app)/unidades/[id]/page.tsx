"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useProgress } from "@/components/providers";
import { Empty, PageHeader } from "@/components/ui";
import { CaseCard } from "@/components/case-card";
import { CASES } from "@/lib/data/cases";
import { SYNDROME_GROUPS, SYNDROMES } from "@/lib/data/syndromes";
import { getUnit } from "@/lib/data/units";
import { addHistory, awardXp, unitProgress } from "@/lib/progress";

type Tab = "conceptos" | "palabras" | "quiz" | "casos" | "sindromes";

export default function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const unit = getUnit(Number(id));
  const { progress, update } = useProgress();
  const [tab, setTab] = useState<Tab>("conceptos");
  const [open, setOpen] = useState<string | null>(null);

  if (!unit) return <Empty emoji="🤔" title="Unidad no encontrada" text="Esta unidad no existe." action={<Link href="/unidades" className="btn btn-primary">Ver unidades</Link>} />;

  const state = progress.units[unit.id] ?? { best: 0, read: false };
  const cases = CASES.filter((c) => c.unitId === unit.id);
  const pct = unitProgress(progress, unit.id);
  const tabs: { id: Tab; label: string }[] = [
    { id: "conceptos", label: "📖 Conceptos" },
    { id: "palabras", label: `🔑 Palabras clave (${unit.terms.length})` },
    { id: "quiz", label: "✅ Quiz" },
    ...(unit.id === 12 ? [{ id: "sindromes" as Tab, label: `🧩 Síndromes (${SYNDROMES.length})` }] : []),
    ...(cases.length ? [{ id: "casos" as Tab, label: `🩺 Casos (${cases.length})` }] : []),
  ];

  function markRead() {
    update((p) => {
      let n = { ...p, units: { ...p.units, [unit!.id]: { ...(p.units[unit!.id] ?? { best: 0 }), read: true } } };
      n = awardXp(n, 5);
      return addHistory(n, { kind: "quiz", title: `Lectura: ${unit!.short}`, score: 1, total: 1, xp: 5 });
    });
  }

  return (
    <div>
      <PageHeader back="/unidades" title={`${unit.emoji} ${unit.title}`} subtitle={`Unidad ${unit.id} · ${pct}% completado`} />

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: unit.color }} />
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl border-2 border-b-4 px-4 py-2 text-sm font-extrabold transition ${
              tab === t.id ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)] muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "conceptos" && (
        <div className="flex flex-col gap-3">
          {unit.concepts.map((c, i) => (
            <div key={i} className="card flex gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-white" style={{ background: unit.color }}>
                {i + 1}
              </span>
              <p className="font-semibold leading-relaxed">{c}</p>
            </div>
          ))}
          {unit.id === 12 &&
            SYNDROME_GROUPS.filter((g) => g.concepts.length).map((g) => (
              <div key={g.id} className="card p-4">
                <p className="mb-2 font-black">{g.name}</p>
                <ul className="list-disc space-y-1 pl-5 font-semibold">
                  {g.concepts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          <div className="mt-2 flex flex-col gap-3 md:flex-row">
            {state.read ? (
              <span className="btn btn-ghost flex-1 !text-brand">✓ Leído</span>
            ) : (
              <button className="btn btn-primary flex-1" onClick={markRead}>
                Marcar como leído (+5 XP)
              </button>
            )}
            <button className="btn btn-sky flex-1" onClick={() => setTab("palabras")}>
              Ver palabras clave →
            </button>
          </div>
        </div>
      )}

      {tab === "palabras" && (
        <div className="grid gap-3 md:grid-cols-2">
          {unit.terms.map((t) => {
            const s = progress.terms[t.id];
            const isOpen = open === t.id;
            return (
              <button key={t.id} onClick={() => setOpen(isOpen ? null : t.id)} className="card p-4 text-left transition hover:bg-[var(--surface-2)]">
                <div className="flex items-start gap-2">
                  <p className="flex-1 font-black" style={{ color: unit.color }}>
                    {t.term}
                  </p>
                  {s && s.box >= 3 && <span title="Dominado">👑</span>}
                  {s && s.w > 0 && s.box < 3 && <span title="En repaso">🔄</span>}
                </div>
                <p className={`mt-1 font-semibold ${isOpen ? "" : "line-clamp-2"}`}>{t.def}</p>
              </button>
            );
          })}
          <Link href={`/retos/flashcards?unit=${unit.id}`} className="btn btn-sky md:col-span-2">
            🃏 Practicar con flashcards
          </Link>
        </div>
      )}

      {tab === "quiz" && (
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <div className="text-6xl">✅</div>
          <h3 className="text-xl font-black">Quiz de {unit.short}</h3>
          <p className="muted max-w-md font-semibold">
            10 preguntas con las palabras clave y los ejemplos de la unidad. Ganas 10 XP por acierto y un bonus si no fallas ninguna.
          </p>
          <p className="font-black">
            Mejor resultado: <span style={{ color: unit.color }}>{state.best}%</span>
          </p>
          <div className="w-full max-w-md">
            <p className="mb-2 text-left text-sm font-black">Preguntas de ejemplo</p>
            {unit.quiz.map((q) => (
              <p key={q.q} className="muted mb-1 text-left text-sm font-semibold">
                • {q.q}
              </p>
            ))}
          </div>
          <Link href={`/unidades/${unit.id}/quiz`} className="btn btn-primary w-full max-w-xs">
            Empezar quiz
          </Link>
        </div>
      )}

      {tab === "sindromes" && (
        <div className="flex flex-col gap-6">
          {SYNDROME_GROUPS.map((g) => (
            <section key={g.id}>
              <h3 className="mb-2 font-black">{g.name}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {SYNDROMES.filter((s) => s.group === g.id).map((s) => (
                  <Link key={s.id} href={`/sindromes/${s.id}`} className="card flex items-center gap-3 p-3 hover:bg-[var(--surface-2)]">
                    <span className="text-2xl">🧩</span>
                    <span className="flex-1 font-bold">{s.name}</span>
                    <span className="muted">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "casos" && (
        <div className="grid gap-3 md:grid-cols-2">
          {cases.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
