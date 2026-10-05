"use client";

import { useState } from "react";
import { QuizRunner } from "@/components/quiz-runner";
import { PageHeader } from "@/components/ui";
import { UnitPicker } from "@/components/unit-picker";
import type { HistoryEntry } from "@/lib/progress";
import type { Question } from "@/lib/quiz";

type Props = {
  title: string;
  icon: string;
  subtitle: string;
  kind: HistoryEntry["kind"];
  units?: number[];
  build: (unit: number) => Question[];
};

/** Pantalla previa común: elegir unidad y lanzar el QuizRunner. */
export function PracticeSetup({ title, icon, subtitle, kind, units, build }: Props) {
  const [unit, setUnit] = useState(0);
  const [run, setRun] = useState<{ n: number; qs: Question[] } | null>(null);

  if (run)
    return (
      <QuizRunner
        key={run.n}
        title={title}
        questions={run.qs}
        exitHref="/retos"
        kind={kind}
        onRestart={() => setRun({ n: run.n + 1, qs: build(unit) })}
      />
    );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/retos" title={`${icon} ${title}`} subtitle={subtitle} />
      <p className="mb-2 text-sm font-black">Elige el tema</p>
      <div className="mb-6">
        <UnitPicker value={unit} onChange={setUnit} units={units} />
      </div>
      <div className="card flex flex-col items-center gap-4 p-8 text-center">
        <div className="text-7xl">{icon}</div>
        <button className="btn btn-primary w-full max-w-xs" onClick={() => setRun({ n: 1, qs: build(unit) })}>
          Empezar
        </button>
      </div>
    </div>
  );
}
