"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/components/providers";
import { Empty, PageHeader } from "@/components/ui";
import { UnitPicker } from "@/components/unit-picker";
import { ALL_TERMS, getUnit } from "@/lib/data/units";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Glosario() {
  const { progress } = useProgress();
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState(0);
  const [inDefs, setInDefs] = useState(false);

  const list = useMemo(() => {
    const nq = norm(q.trim());
    return ALL_TERMS.filter((t) => (!unit || t.unitId === unit) && (!nq || norm(t.term).includes(nq) || (inDefs && norm(t.def).includes(nq)))).sort(
      (a, b) => a.term.localeCompare(b.term, "es"),
    );
  }, [q, unit, inDefs]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const t of list) {
      const k = norm(t.term[0]).toUpperCase();
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      <PageHeader title="🔍 Glosario" subtitle={`${ALL_TERMS.length} términos con su definición`} />
      <div className="sticky top-14 z-10 -mx-4 mb-4 bg-[var(--bg)] px-4 pb-3 pt-1 lg:top-0 lg:pt-3">
        <input className="input mb-3" placeholder="Buscar término…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        <label className="muted mb-3 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={inDefs} onChange={(e) => setInDefs(e.target.checked)} className="h-4 w-4 accent-[var(--color-sky)]" />
          Buscar también dentro de las definiciones
        </label>
        <UnitPicker value={unit} onChange={setUnit} />
      </div>

      <p className="muted mb-3 text-sm font-bold">{list.length} resultados</p>
      {list.length === 0 ? (
        <Empty emoji="🔍" title="Sin resultados" text="Prueba otra palabra o activa la búsqueda en definiciones." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([letter, terms]) => (
            <section key={letter}>
              <h3 className="mb-2 text-xl font-black text-sky">{letter}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {terms.map((t) => {
                  const u = getUnit(t.unitId)!;
                  const s = progress.terms[t.id];
                  return (
                    <div key={t.id} className="card p-4">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 font-black">{t.term}</p>
                        {s && s.box >= 3 && <span title="Dominado">👑</span>}
                        <span className="chip shrink-0" style={{ color: u.color, borderColor: `${u.color}55` }}>
                          {u.emoji} U{u.id}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-relaxed">{t.def}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
