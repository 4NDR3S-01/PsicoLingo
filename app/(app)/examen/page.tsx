"use client";

import { useCallback, useState } from "react";
import { useProgress } from "@/components/providers";
import { QuizRunner, type RunResult } from "@/components/quiz-runner";
import { Mascot, PageHeader } from "@/components/ui";
import type { Progress } from "@/lib/progress";
import { examQuestions, type Question } from "@/lib/quiz";

const PRESETS = [
  { n: 15, min: 10, label: "Corto" },
  { n: 25, min: 20, label: "Estándar" },
  { n: 40, min: 35, label: "Completo" },
];

export default function Examen() {
  const { progress } = useProgress();
  const [preset, setPreset] = useState(1);
  const [run, setRun] = useState<{ n: number; qs: Question[] } | null>(null);
  const cfg = PRESETS[preset];

  const onFinish = useCallback(
    (r: RunResult, p: Progress): Progress => ({
      ...p,
      exams: [{ at: new Date().toISOString(), score: r.correct, total: r.total, seconds: r.seconds }, ...p.exams].slice(0, 30),
    }),
    [],
  );

  if (run)
    return (
      <QuizRunner
        key={run.n}
        title={`Examen ${cfg.label.toLowerCase()}`}
        questions={run.qs}
        exitHref="/examen"
        kind="examen"
        exam={{ seconds: cfg.min * 60 }}
        onFinish={onFinish}
        onExit={() => setRun(null)}
        onRestart={() => setRun({ n: run.n + 1, qs: examQuestions(cfg.n) })}
      />
    );

  const best = progress.exams.reduce((b, e) => Math.max(b, Math.round((e.score / e.total) * 100)), 0);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="📝 Modo examen" subtitle="Simulación cronometrada con términos y casos clínicos de todo el temario." />
      <Mascot text="Sin pistas ni correcciones hasta el final. ¡Concéntrate como en el examen real!" emoji="⏱️" />

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPreset(i)}
            className={`flex flex-col items-center rounded-2xl border-2 border-b-4 p-4 transition ${preset === i ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)]"}`}
          >
            <span className="text-2xl font-black">{p.n}</span>
            <span className="text-xs font-black uppercase">preguntas</span>
            <span className="muted mt-1 text-xs font-bold">
              {p.label} · {p.min} min
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-primary mt-5 w-full" onClick={() => setRun({ n: 1, qs: examQuestions(cfg.n) })}>
        Comenzar examen
      </button>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black">Historial de exámenes</h3>
          {best > 0 && <span className="chip text-brand">Mejor: {best}%</span>}
        </div>
        {progress.exams.length === 0 ? (
          <p className="muted font-semibold">Aún no has hecho ningún examen.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {progress.exams.map((e) => {
              const pct = Math.round((e.score / e.total) * 100);
              return (
                <div key={e.at} className="card flex items-center gap-3 p-3">
                  <span className="text-2xl">{pct >= 80 ? "🎓" : pct >= 50 ? "📘" : "📕"}</span>
                  <div className="flex-1">
                    <p className="font-bold">
                      {e.score}/{e.total} correctas
                    </p>
                    <p className="muted text-xs font-semibold">
                      {new Date(e.at).toLocaleString("es")} · {Math.floor(e.seconds / 60)} min {e.seconds % 60} s
                    </p>
                  </div>
                  <span className={`text-lg font-black ${pct >= 80 ? "text-brand" : pct >= 50 ? "text-flame" : "text-danger"}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
