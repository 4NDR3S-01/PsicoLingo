"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "@/components/providers";
import { Bar } from "@/components/ui";
import { addHistory, awardXp, recordTerm, type HistoryEntry, type Progress } from "@/lib/progress";
import type { Question } from "@/lib/quiz";

export type Answer = { q: Question; chosen: string | null; ok: boolean };
export type RunResult = { answers: Answer[]; correct: number; total: number; seconds: number; xp: number };

type Props = {
  title: string;
  questions: Question[];
  exitHref: string;
  kind: HistoryEntry["kind"];
  /** Modo examen: sin feedback inmediato y con cronómetro. */
  exam?: { seconds: number };
  /** Cambios extra al progreso al terminar (mejor nota de unidad, examen…). */
  onFinish?: (r: RunResult, p: Progress) => Progress;
  onRestart?: () => void;
  /** Si se indica, "Continuar" en resultados llama a esto en vez de navegar. */
  onExit?: () => void;
};

function beep(ok: boolean) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    const notes = ok ? [660, 880] : [300, 220];
    o.frequency.setValueAtTime(notes[0], ctx.currentTime);
    o.frequency.setValueAtTime(notes[1], ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.start();
    o.stop(ctx.currentTime + 0.26);
  } catch {}
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function QuizRunner({ title, questions, exitHref, kind, exam, onFinish, onRestart, onExit }: Props) {
  const { progress, update } = useProgress();
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const answersRef = useRef<Answer[]>([]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [left, setLeft] = useState(exam?.seconds ?? 0);
  const start = useRef(0);
  const finished = useRef(false);

  const q = questions[idx];
  const sound = progress.settings.sound;

  const finish = useCallback(
    (all: Answer[]) => {
      if (finished.current) return;
      finished.current = true;
      // Las preguntas sin responder (examen con tiempo agotado) cuentan como fallos.
      const padded = [
        ...all,
        ...questions.slice(all.length).map((q) => ({ q, chosen: null, ok: false })),
      ];
      const correct = padded.filter((a) => a.ok).length;
      const total = padded.length;
      const perfect = correct === total && total > 0;
      const xp = correct * 10 + (perfect ? 10 : 0);
      const r: RunResult = { answers: padded, correct, total, seconds: Math.round((Date.now() - start.current) / 1000), xp };
      update((p) => {
        let n = p;
        for (const a of padded) if (a.q.termId) n = recordTerm(n, a.q.termId, a.ok);
        for (const a of padded) {
          // Solo la pregunta principal de un caso marca el caso como resuelto.
          if (a.q.caseId && !/-f\d+$/.test(a.q.id)) {
            const prev = n.cases[a.q.caseId];
            if (!prev?.ok) n = { ...n, cases: { ...n.cases, [a.q.caseId]: { ok: a.ok, at: new Date().toISOString() } } };
          }
        }
        if (xp > 0) n = awardXp(n, xp);
        n = addHistory(n, { kind, title, score: correct, total, xp });
        if (perfect) n = { ...n, perfects: n.perfects + 1 };
        return onFinish ? onFinish(r, n) : n;
      });
      setResult(r);
    },
    [questions, update, kind, title, onFinish],
  );

  useEffect(() => {
    start.current = Date.now();
  }, []);

  // Cronómetro del modo examen
  useEffect(() => {
    if (!exam || result) return;
    const t = setInterval(() => {
      const remaining = exam.seconds - Math.floor((Date.now() - start.current) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(t);
        finish(answersRef.current);
      }
    }, 500);
    return () => clearInterval(t);
  }, [exam, result, finish]);

  const check = useCallback(() => {
    if (!chosen || !q) return;
    const ok = chosen === q.answer;
    const next = [...answers, { q, chosen, ok }];
    setAnswers(next);
    if (exam) {
      setChosen(null);
      if (idx + 1 >= questions.length) finish(next);
      else setIdx(idx + 1);
      return;
    }
    if (sound) beep(ok);
    setChecked(true);
  }, [chosen, q, answers, exam, idx, questions.length, finish, sound]);

  const next = useCallback(() => {
    setChecked(false);
    setChosen(null);
    if (idx + 1 >= questions.length) finish(answers);
    else setIdx(idx + 1);
  }, [idx, questions.length, finish, answers]);

  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      if (!q) return;
      const n = Number(e.key);
      if (!checked && n >= 1 && n <= q.options.length) setChosen(q.options[n - 1]);
      if (e.key !== "Enter") return;
      if (checked) next();
      else check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, checked, check, next, result]);

  if (result) return <Results title={title} r={result} exitHref={exitHref} onRestart={onRestart} onExit={onExit} />;
  if (!q) return null;

  const last = answers[answers.length - 1];
  const isOk = checked && last?.ok;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5">
        {onExit ? (
          <button onClick={onExit} aria-label="Salir" className="muted text-2xl font-black">
            ✕
          </button>
        ) : (
          <Link href={exitHref} aria-label="Salir" className="muted text-2xl font-black">
            ✕
          </Link>
        )}
        <Bar value={(idx / questions.length) * 100} />
        {exam ? (
          <span className={`min-w-14 text-right font-black ${left < 60 ? "text-danger" : "text-sky"}`}>⏱ {fmt(left)}</span>
        ) : (
          <span className="muted min-w-10 text-right text-sm font-black">
            {idx + 1}/{questions.length}
          </span>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-48 pt-6">
        <p className="mb-1 text-xs font-black uppercase tracking-wider text-sky">{title}</p>
        <h2 className="mb-4 text-xl font-black md:text-2xl">{q.prompt}</h2>
        {q.context && (
          <div className="card mb-5 flex gap-3 p-4">
            <span className="text-3xl">{q.kind === "case" ? "🩺" : "📖"}</span>
            <p className="font-semibold leading-relaxed">{q.context}</p>
          </div>
        )}
        <div className="grid gap-3">
          {q.options.map((o, i) => {
            const sel = chosen === o;
            let cls = "border-[var(--line)] hover:bg-[var(--surface-2)]";
            if (checked && o === q.answer) cls = "border-brand bg-brand/10 text-brand-dark dark:text-brand";
            else if (checked && sel) cls = "border-danger bg-danger/10 text-danger animate-shake";
            else if (sel) cls = "border-sky bg-sky/10 text-sky";
            return (
              <button
                key={o}
                disabled={checked}
                onClick={() => setChosen(o)}
                className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3.5 text-left font-bold transition ${cls}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-current text-xs opacity-70">
                  {i + 1}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 border-t-2 pb-[env(safe-area-inset-bottom)] ${
          !checked ? "border-[var(--line)] bg-[var(--bg)]" : isOk ? "animate-slideup border-transparent bg-[#d7ffb8] dark:bg-[#1f3b16]" : "animate-slideup border-transparent bg-[#ffdfe0] dark:bg-[#3b1f22]"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center">
          {checked && (
            <div className={`flex-1 ${isOk ? "text-brand-dark dark:text-brand" : "text-danger"}`}>
              <p className="text-xl font-black">{isOk ? "¡Excelente! 🎉" : "Respuesta correcta:"}</p>
              {!isOk && <p className="font-bold">{q.answer}</p>}
              {q.explain && (
                <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line text-sm font-semibold opacity-80">{q.explain}</p>
              )}
            </div>
          )}
          {!checked ? (
            <button className="btn btn-primary w-full md:ml-auto md:w-48" disabled={!chosen} onClick={check}>
              {exam && idx + 1 === questions.length ? "Terminar" : "Comprobar"}
            </button>
          ) : (
            <button className={`btn w-full md:w-48 ${isOk ? "btn-primary" : "btn-danger"}`} onClick={next}>
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Results({ title, r, exitHref, onRestart, onExit }: { title: string; r: RunResult; exitHref: string; onRestart?: () => void; onExit?: () => void }) {
  const pct = Math.round((r.correct / Math.max(1, r.total)) * 100);
  const wrong = r.answers.filter((a) => !a.ok);
  const face = pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚";
  const msg = pct === 100 ? "¡Perfecto!" : pct >= 80 ? "¡Muy bien!" : pct >= 50 ? "¡Buen trabajo!" : "Sigue practicando";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)]">
      <div className="animate-pop mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-10 text-center">
        <div className="text-8xl">{face}</div>
        <h2 className="text-3xl font-black text-gold">{msg}</h2>
        <p className="muted font-bold">{title}</p>
        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-gold bg-gold p-1">
            <p className="text-xs font-black uppercase text-white">XP total</p>
            <p className="rounded-xl bg-[var(--surface)] py-3 text-xl font-black text-gold">+{r.xp}</p>
          </div>
          <div className="rounded-2xl border-2 border-brand bg-brand p-1">
            <p className="text-xs font-black uppercase text-white">Aciertos</p>
            <p className="rounded-xl bg-[var(--surface)] py-3 text-xl font-black text-brand">{pct}%</p>
          </div>
          <div className="rounded-2xl border-2 border-sky bg-sky p-1">
            <p className="text-xs font-black uppercase text-white">Tiempo</p>
            <p className="rounded-xl bg-[var(--surface)] py-3 text-xl font-black text-sky">{fmt(r.seconds)}</p>
          </div>
        </div>

        {wrong.length > 0 && (
          <div className="w-full text-left">
            <h3 className="mb-2 font-black">Para repasar ({wrong.length})</h3>
            <p className="muted mb-3 text-sm font-semibold">Los términos fallados se añadieron a tu Repaso espaciado.</p>
            <div className="flex flex-col gap-2">
              {wrong.map((a, i) => (
                <div key={i} className="card p-3 text-sm">
                  <p className="font-bold">{a.q.context && a.q.kind !== "case" ? a.q.context : a.q.prompt}</p>
                  {a.chosen && <p className="mt-1 font-semibold text-danger line-through">{a.chosen}</p>}
                  <p className="mt-1 font-bold text-brand-dark dark:text-brand">✓ {a.q.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex w-full flex-col gap-3 md:flex-row">
          {onRestart && (
            <button className="btn btn-ghost flex-1" onClick={onRestart}>
              Repetir
            </button>
          )}
          {onExit ? (
            <button className="btn btn-primary flex-1" onClick={onExit}>
              Continuar
            </button>
          ) : (
            <Link href={exitHref} className="btn btn-primary flex-1">
              Continuar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
