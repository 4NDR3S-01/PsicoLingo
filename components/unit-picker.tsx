"use client";

import { UNITS } from "@/lib/data/units";

export function UnitPicker({ value, onChange, units = UNITS.map((u) => u.id) }: { value: number; onChange: (v: number) => void; units?: number[] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      <button
        onClick={() => onChange(0)}
        className={`shrink-0 rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-extrabold ${value === 0 ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)] muted"}`}
      >
        🌐 Todas
      </button>
      {UNITS.filter((u) => units.includes(u.id)).map((u) => (
        <button
          key={u.id}
          onClick={() => onChange(u.id)}
          className={`shrink-0 rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-extrabold ${value === u.id ? "border-sky bg-sky/10 text-sky" : "border-[var(--line)] muted"}`}
        >
          {u.emoji} {u.short}
        </button>
      ))}
    </div>
  );
}
