"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DIFF_COLOR } from "@/components/case-card";
import { useProgress } from "@/components/providers";
import { QuizRunner } from "@/components/quiz-runner";
import { Empty, PageHeader } from "@/components/ui";
import { CASES, getCase } from "@/lib/data/cases";
import { getSyndrome } from "@/lib/data/syndromes";
import { getUnit } from "@/lib/data/units";
import { caseFollowUps, caseQuestion } from "@/lib/quiz";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const c = getCase(Number(id));
  const { progress } = useProgress();
  const [playing, setPlaying] = useState(0);
  const [reveal, setReveal] = useState(false);

  if (!c) return <Empty emoji="🤔" title="Caso no encontrado" text="Vuelve a la lista de casos." action={<Link href="/casos" className="btn btn-primary">Casos</Link>} />;

  if (playing) {
    const main = { ...caseQuestion(c), id: `case-${c.id}-main`, explain: undefined };
    return (
      <QuizRunner
        key={playing}
        title={`Caso ${c.id}`}
        questions={[main, ...caseFollowUps(c)]}
        exitHref="/casos"
        kind="caso"
        onRestart={() => setPlaying((p) => p + 1)}
      />
    );
  }

  const st = progress.cases[c.id];
  const unit = getUnit(c.unitId)!;
  const syn = c.syndromeId ? getSyndrome(c.syndromeId) : undefined;
  const nextCase = CASES.find((x) => x.id > c.id && !progress.cases[x.id]?.ok) ?? CASES.find((x) => !progress.cases[x.id]?.ok);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader back="/casos" title={`Caso ${c.id}${st?.ok ? ` · ${c.title}` : ""}`} subtitle={`${unit.emoji} Unidad ${unit.id}: ${unit.short}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="chip" style={{ color: DIFF_COLOR[c.difficulty], borderColor: `${DIFF_COLOR[c.difficulty]}66` }}>
          {c.difficulty}
        </span>
        <span className="chip">{c.qa.length} preguntas</span>
        {st && <span className="chip">{st.ok ? "✅ Resuelto" : "🔁 Inténtalo de nuevo"}</span>}
      </div>

      <div className="card mb-5 p-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-sky">📋 Viñeta clínica</p>
        <p className="text-lg font-semibold leading-relaxed">{c.vignette}</p>
      </div>

      <div className="card mb-5 p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-sky">❓ Preguntas</p>
        <ol className="flex flex-col gap-3">
          {c.qa.map((qa, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sm font-black text-sky">{i + 1}</span>
              <div>
                <p className="font-bold">{qa.q}</p>
                {reveal && <p className="mt-1 font-semibold text-brand-dark dark:text-brand">→ {qa.a}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <button className="btn btn-primary flex-1" onClick={() => setPlaying(1)}>
          {st ? "Resolver de nuevo" : "Resolver caso"}
        </button>
        <button className="btn btn-ghost flex-1" onClick={() => setReveal((r) => !r)}>
          {reveal ? "Ocultar respuestas" : "Ver respuestas"}
        </button>
      </div>

      {(syn || nextCase) && (
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          {syn && reveal && (
            <Link href={`/sindromes/${syn.id}`} className="card flex-1 p-4 font-bold hover:bg-[var(--surface-2)]">
              🧩 Ver ficha: {syn.name}
            </Link>
          )}
          {nextCase && nextCase.id !== c.id && (
            <Link href={`/casos/${nextCase.id}`} className="card flex-1 p-4 font-bold hover:bg-[var(--surface-2)]">
              ➡️ Siguiente caso pendiente: Caso {nextCase.id}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
