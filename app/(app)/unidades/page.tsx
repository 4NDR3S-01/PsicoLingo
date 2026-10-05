"use client";

import Link from "next/link";
import { useProgress } from "@/components/providers";
import { PageHeader } from "@/components/ui";
import { CASES } from "@/lib/data/cases";
import { UNITS } from "@/lib/data/units";
import { unitProgress } from "@/lib/progress";

const OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60];

function Ring({ pct, color, children }: { pct: number; color: string; children: React.ReactNode }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[104px] w-[104px]">
      <svg viewBox="0 0 104 104" className="absolute inset-0 -rotate-90">
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-[13px]">{children}</div>
    </div>
  );
}

export default function Unidades() {
  const { progress } = useProgress();

  return (
    <div>
      <PageHeader title="Unidades" subtitle="12 unidades de semiología y psicopatología. Toca una para empezar." />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Camino */}
        <div className="flex flex-col items-center gap-4 py-4">
          {UNITS.map((u, i) => {
            const pct = unitProgress(progress, u.id);
            const done = pct >= 100;
            return (
              <div key={u.id} className="flex flex-col items-center translate-x-[calc(var(--o)*0.5px)] sm:translate-x-[calc(var(--o)*1px)]" style={{ "--o": OFFSETS[i % OFFSETS.length] } as React.CSSProperties}>
                <Link href={`/unidades/${u.id}`} className="group flex flex-col items-center gap-1" aria-label={u.title}>
                  <Ring pct={pct} color={u.color}>
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full border-b-[6px] text-4xl transition group-hover:brightness-110 group-active:translate-y-1 group-active:border-b-2"
                      style={{ background: u.color, borderColor: "rgba(0,0,0,.25)" }}
                    >
                      {done ? "👑" : u.emoji}
                    </div>
                  </Ring>
                  <span className="max-w-40 text-center text-sm font-black">
                    {u.id}. {u.short}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {UNITS.map((u) => {
            const pct = unitProgress(progress, u.id);
            const cases = CASES.filter((c) => c.unitId === u.id).length;
            return (
              <Link key={u.id} href={`/unidades/${u.id}`} className="card flex items-center gap-3 p-3 transition hover:bg-[var(--surface-2)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${u.color}25` }}>
                  {u.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">
                    {u.id}. {u.title}
                  </p>
                  <p className="muted text-xs font-bold">
                    {u.terms.length} términos{cases ? ` · ${cases} casos` : ""}
                  </p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: u.color }} />
                  </div>
                </div>
                <span className="text-sm font-black" style={{ color: u.color }}>
                  {pct}%
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
