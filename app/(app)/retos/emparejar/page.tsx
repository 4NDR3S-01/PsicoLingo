"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/components/providers";
import { Bar, PageHeader } from "@/components/ui";
import { UnitPicker } from "@/components/unit-picker";
import { ALL_TERMS, getUnit, type Term } from "@/lib/data/units";
import { addHistory, awardXp, recordTerm } from "@/lib/progress";
import { sample, shuffle } from "@/lib/quiz";

const ROUNDS = 3;
const PAIRS = 5;

function makeRounds(unit: number): Term[][] {
  const pool = ALL_TERMS.filter((t) => !unit || t.unitId === unit);
  const picked = sample(pool, Math.min(pool.length, ROUNDS * PAIRS));
  const rounds: Term[][] = [];
  for (let i = 0; i < picked.length; i += PAIRS) rounds.push(picked.slice(i, i + PAIRS));
  return rounds.filter((r) => r.length >= 2);
}

export default function Emparejar() {
  const { update } = useProgress();
  const [unit, setUnit] = useState(0);
  const [rounds, setRounds] = useState(() => makeRounds(0));
  const [r, setR] = useState(0);
  const [defs, setDefs] = useState(() => shuffle(rounds[0]));
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [start, setStart] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<null | { ok: number; total: number; xp: number; secs: number }>(null);

  const round = rounds[r] ?? [];

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(t);
  }, [start, done]);

  function restart(u = unit) {
    const rs = makeRounds(u);
    setUnit(u);
    setRounds(rs);
    setR(0);
    setDefs(shuffle(rs[0] ?? []));
    setLeft(null);
    setMatched(new Set());
    setMissed(new Set());
    setStart(Date.now());
    setElapsed(0);
    setDone(null);
  }

  function pickDef(t: Term) {
    if (!left || matched.has(t.id)) return;
    if (t.id === left) {
      const m = new Set(matched).add(t.id);
      setMatched(m);
      setLeft(null);
      if (round.every((x) => m.has(x.id))) {
        setTimeout(() => {
          if (r + 1 < rounds.length) {
            setR(r + 1);
            setDefs(shuffle(rounds[r + 1]));
          } else finish(m);
        }, 400);
      }
    } else {
      setMissed(new Set(missed).add(left));
      setWrong(t.id);
      setTimeout(() => {
        setWrong(null);
        setLeft(null);
      }, 450);
    }
  }

  function finish(m: Set<string>) {
    const all = rounds.flat();
    const ok = all.filter((t) => !missed.has(t.id)).length;
    const xp = all.length * 2 + (ok === all.length ? 10 : 0);
    const secs = elapsed;
    update((p) => {
      let n = p;
      for (const t of all) n = recordTerm(n, t.id, m.has(t.id) && !missed.has(t.id));
      n = awardXp(n, xp);
      n = addHistory(n, { kind: "emparejar", title: unit ? `Emparejar · ${getUnit(unit)!.short}` : "Emparejar", score: ok, total: all.length, xp });
      return ok === all.length ? { ...n, perfects: n.perfects + 1 } : n;
    });
    setDone({ ok, total: all.length, xp, secs });
  }

  const tile = "rounded-2xl border-2 border-b-4 p-3 text-left text-sm font-bold transition min-h-16";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader back="/retos" title="🧩 Emparejar" subtitle="Toca un término y luego su definición." right={<span className="chip text-sky">⏱ {elapsed}s</span>} />
      <div className="mb-5">
        <UnitPicker value={unit} onChange={(u) => restart(u)} units={[1, 3, 4, 5, 6, 7, 8, 9, 10, 12]} />
      </div>

      {done ? (
        <div className="card animate-pop flex flex-col items-center gap-3 p-8 text-center">
          <div className="text-6xl">{done.ok === done.total ? "🏆" : "🎉"}</div>
          <h3 className="text-2xl font-black">¡Completado en {done.secs}s!</h3>
          <p className="font-bold">
            {done.ok}/{done.total} a la primera · <span className="text-gold">+{done.xp} XP</span>
          </p>
          <button className="btn btn-primary mt-2" onClick={() => restart()}>
            Jugar otra vez
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3">
            <Bar value={((r + matched.size / Math.max(1, round.length)) / rounds.length) * 100} color="var(--color-sky)" />
            <span className="muted text-sm font-black">
              Ronda {r + 1}/{rounds.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col gap-3">
              {round.map((t) => {
                const m = matched.has(t.id);
                const sel = left === t.id;
                return (
                  <button
                    key={t.id}
                    disabled={m}
                    onClick={() => setLeft(t.id)}
                    className={`${tile} ${m ? "border-brand/40 bg-brand/10 text-brand opacity-50" : sel ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)] hover:bg-[var(--surface-2)]"} ${sel && wrong ? "animate-shake !border-danger !text-danger" : ""}`}
                  >
                    {t.term}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              {defs.map((t) => {
                const m = matched.has(t.id);
                return (
                  <button
                    key={t.id}
                    disabled={m}
                    onClick={() => pickDef(t)}
                    className={`${tile} text-xs md:text-sm ${m ? "border-brand/40 bg-brand/10 text-brand opacity-50" : wrong === t.id ? "animate-shake border-danger bg-danger/10 text-danger" : "border-[var(--line)] hover:bg-[var(--surface-2)]"}`}
                  >
                    {t.def}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
