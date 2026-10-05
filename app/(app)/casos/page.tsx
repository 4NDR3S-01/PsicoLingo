"use client";

import { useMemo, useState } from "react";
import { CaseCard } from "@/components/case-card";
import { useProgress } from "@/components/providers";
import { Empty, PageHeader } from "@/components/ui";
import { CASES, type Difficulty } from "@/lib/data/cases";
import { SYNDROMES } from "@/lib/data/syndromes";
import { UNITS } from "@/lib/data/units";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const PAGE = 24;

export default function Casos() {
  const { progress } = useProgress();
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState("");
  const [syn, setSyn] = useState("");
  const [diff, setDiff] = useState<"" | Difficulty>("");
  const [status, setStatus] = useState<"" | "pend" | "ok">("");
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const nq = norm(q);
    return CASES.filter(
      (c) =>
        (!unit || c.unitId === Number(unit)) &&
        (!syn || c.syndromeId === syn) &&
        (!diff || c.difficulty === diff) &&
        (!status || (status === "ok" ? progress.cases[c.id]?.ok : !progress.cases[c.id]?.ok)) &&
        (!nq || norm(c.vignette).includes(nq) || String(c.id) === nq),
    );
  }, [q, unit, syn, diff, status, progress.cases]);

  const solved = Object.values(progress.cases).filter((c) => c.ok).length;
  const reset = (fn: () => void) => {
    fn();
    setLimit(PAGE);
  };

  return (
    <div>
      <PageHeader title="Casos clínicos" subtitle={`${solved} de ${CASES.length} resueltos · lee la viñeta y llega al diagnóstico`} />

      <div className="card mb-5 grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-5">
        <input className="input lg:col-span-5" placeholder="🔍 Buscar en las viñetas…" value={q} onChange={(e) => reset(() => setQ(e.target.value))} />
        <select className="input" value={syn} onChange={(e) => reset(() => setSyn(e.target.value))}>
          <option value="">Todos los síndromes</option>
          {SYNDROMES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="input" value={unit} onChange={(e) => reset(() => setUnit(e.target.value))}>
          <option value="">Todas las unidades</option>
          {UNITS.filter((u) => CASES.some((c) => c.unitId === u.id)).map((u) => (
            <option key={u.id} value={u.id}>
              {u.id}. {u.short}
            </option>
          ))}
        </select>
        <select className="input" value={diff} onChange={(e) => reset(() => setDiff(e.target.value as Difficulty | ""))}>
          <option value="">Toda dificultad</option>
          <option>Fácil</option>
          <option>Media</option>
          <option>Difícil</option>
        </select>
        <select className="input" value={status} onChange={(e) => reset(() => setStatus(e.target.value as "" | "pend" | "ok"))}>
          <option value="">Todos</option>
          <option value="pend">Pendientes</option>
          <option value="ok">Resueltos</option>
        </select>
        <button className="btn btn-ghost" onClick={() => reset(() => { setQ(""); setUnit(""); setSyn(""); setDiff(""); setStatus(""); })}>
          Limpiar
        </button>
      </div>

      <p className="muted mb-3 text-sm font-bold">{list.length} casos</p>
      {list.length === 0 ? (
        <Empty emoji="🩺" title="Sin resultados" text="Prueba con otros filtros." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.slice(0, limit).map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
          {limit < list.length && (
            <button className="btn btn-ghost mx-auto mt-5 flex" onClick={() => setLimit((l) => l + PAGE)}>
              Ver más casos
            </button>
          )}
        </>
      )}
    </div>
  );
}
