"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/components/providers";
import { QuizRunner } from "@/components/quiz-runner";
import { Empty, Mascot, PageHeader } from "@/components/ui";
import { TERM_BY_ID, getUnit } from "@/lib/data/units";
import { reviewQueue, today } from "@/lib/progress";
import { defQuestion, shuffle, type Question } from "@/lib/quiz";

const BOXES = ["Nuevo error", "1 día", "2 días", "4 días", "7 días", "Dominado"];

export default function Repaso() {
  const { progress } = useProgress();
  const [run, setRun] = useState<{ n: number; qs: Question[] } | null>(null);
  const queue = reviewQueue(progress);

  const build = () => shuffle(reviewQueue(progress)).slice(0, 15).map(defQuestion);

  if (run)
    return (
      <QuizRunner
        key={run.n}
        title="Repaso espaciado"
        questions={run.qs}
        exitHref="/repaso"
        kind="repaso"
        onExit={() => setRun(null)}
      />
    );

  const tracked = Object.entries(progress.terms).filter(([, s]) => s.w > 0);
  const byBox = BOXES.map((_, i) => tracked.filter(([, s]) => s.box === i).length);
  const upcoming = tracked
    .filter(([, s]) => s.due > today() && s.box < 5)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="🔄 Repaso espaciado" subtitle="Los términos que fallas reaparecen en intervalos crecientes hasta que los dominas." />

      {queue.length === 0 ? (
        <Empty
          emoji="✨"
          title="¡Nada pendiente hoy!"
          text={tracked.length ? "Has repasado todo lo que tocaba. Vuelve mañana." : "Cuando falles un término en cualquier práctica, aparecerá aquí para repasarlo."}
          action={<Link href="/retos" className="btn btn-primary">Ir a retos</Link>}
        />
      ) : (
        <>
          <Mascot text={`Tienes ${queue.length} término${queue.length > 1 ? "s" : ""} para repasar hoy.`} emoji="🔄" />
          <button className="btn btn-primary my-5 w-full" onClick={() => setRun({ n: 1, qs: build() })}>
            Repasar ahora ({Math.min(15, queue.length)})
          </button>
          <div className="grid gap-2 md:grid-cols-2">
            {queue.map((t) => (
              <div key={t.id} className="card flex items-center gap-3 p-3">
                <span className="text-xl">{getUnit(t.unitId)!.emoji}</span>
                <span className="flex-1 font-bold">{t.term}</span>
                <span className="chip text-danger">✗ {progress.terms[t.id].w}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tracked.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 font-black">Cajas de repaso</h3>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {BOXES.map((b, i) => (
              <div key={b} className="card p-3 text-center">
                <p className="text-2xl font-black" style={{ color: i === 5 ? "var(--color-brand)" : i === 0 ? "var(--color-danger)" : "var(--color-sky)" }}>
                  {byBox[i]}
                </p>
                <p className="muted text-xs font-bold">{b}</p>
              </div>
            ))}
          </div>
          {upcoming.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 font-black">Próximos repasos</h3>
              <div className="flex flex-col gap-2">
                {upcoming.map(([id, s]) => (
                  <div key={id} className="card flex items-center justify-between p-3 text-sm">
                    <span className="font-bold">{TERM_BY_ID.get(id)?.term}</span>
                    <span className="muted font-bold">{s.due}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
