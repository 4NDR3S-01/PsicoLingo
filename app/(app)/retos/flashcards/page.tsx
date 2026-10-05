"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useProgress } from "@/components/providers";
import { Bar, PageHeader } from "@/components/ui";
import { UnitPicker } from "@/components/unit-picker";
import { ALL_TERMS, getUnit } from "@/lib/data/units";
import { addHistory, awardXp, recordTerm } from "@/lib/progress";
import { shuffle } from "@/lib/quiz";

export default function FlashcardsPage() {
  return (
    <Suspense>
      <Flashcards />
    </Suspense>
  );
}

function Flashcards() {
  const params = useSearchParams();
  const [unit, setUnit] = useState(Number(params.get("unit")) || 0);
  const [seed, setSeed] = useState(0);
  const deck = useMemo(
    () => shuffle(ALL_TERMS.filter((t) => !unit || t.unitId === unit)).slice(0, 15),
    // seed fuerza un nuevo mazo al reiniciar
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit, seed],
  );
  const { update } = useProgress();
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const card = deck[i];
  const done = i >= deck.length;

  function answer(ok: boolean) {
    const n = known + (ok ? 1 : 0);
    update((p) => {
      let next = recordTerm(p, card.id, ok);
      if (i + 1 >= deck.length) {
        const xp = n * 2;
        if (xp) next = awardXp(next, xp);
        next = addHistory(next, { kind: "flashcards", title: unit ? `Flashcards · ${getUnit(unit)!.short}` : "Flashcards", score: n, total: deck.length, xp });
      }
      return next;
    });
    setKnown(n);
    setFlipped(false);
    setI(i + 1);
  }

  function restart(u = unit) {
    setUnit(u);
    setSeed((s) => s + 1);
    setI(0);
    setKnown(0);
    setFlipped(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/retos" title="🃏 Flashcards" subtitle="Toca la tarjeta para voltearla. Sé honesto contigo 😉" />
      <div className="mb-5">
        <UnitPicker value={unit} onChange={(u) => restart(u)} />
      </div>

      {done ? (
        <div className="card animate-pop flex flex-col items-center gap-3 p-8 text-center">
          <div className="text-6xl">🎉</div>
          <h3 className="text-2xl font-black">¡Mazo terminado!</h3>
          <p className="font-bold">
            Sabías {known} de {deck.length} · <span className="text-gold">+{known * 2} XP</span>
          </p>
          <p className="muted text-sm font-semibold">Las que no sabías pasaron a tu repaso espaciado.</p>
          <button className="btn btn-primary mt-2" onClick={() => restart()}>
            Otro mazo
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3">
            <Bar value={(i / deck.length) * 100} color="#CE82FF" />
            <span className="muted text-sm font-black">
              {i + 1}/{deck.length}
            </span>
          </div>
          <button className="flip block h-72 w-full md:h-80" onClick={() => setFlipped((f) => !f)} aria-label="Voltear tarjeta">
            <div className={`flip-inner h-full ${flipped ? "flipped" : ""}`}>
              <div className="flip-face card flex flex-col items-center justify-center gap-3 border-b-8 p-6">
                <span className="text-4xl">{getUnit(card.unitId)!.emoji}</span>
                <p className="text-center text-2xl font-black md:text-3xl">{card.term}</p>
                <p className="muted text-xs font-black uppercase">Toca para ver la definición</p>
              </div>
              <div className="flip-face flip-back card flex flex-col items-center justify-center gap-3 overflow-y-auto border-b-8 border-[#CE82FF] p-6">
                <p className="text-sm font-black uppercase text-[#CE82FF]">{card.term}</p>
                <p className="text-center text-lg font-bold md:text-xl">{card.def}</p>
              </div>
            </div>
          </button>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="btn btn-danger" disabled={!flipped} onClick={() => answer(false)}>
              No lo sabía
            </button>
            <button className="btn btn-primary" disabled={!flipped} onClick={() => answer(true)}>
              Lo sabía
            </button>
          </div>
        </>
      )}
    </div>
  );
}
