"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CaseCard } from "@/components/case-card";
import { Empty, PageHeader } from "@/components/ui";
import { CASES } from "@/lib/data/cases";
import { getSyndrome, SYNDROME_GROUPS } from "@/lib/data/syndromes";

export default function SyndromeDetail() {
  const { id } = useParams<{ id: string }>();
  const s = getSyndrome(id);
  if (!s) return <Empty emoji="🤔" title="Síndrome no encontrado" text="Revisa la lista de síndromes." action={<Link href="/unidades/12" className="btn btn-primary">Volver</Link>} />;
  const group = SYNDROME_GROUPS.find((g) => g.id === s.group)!;
  const cases = CASES.filter((c) => c.syndromeId === s.id);

  return (
    <div>
      <PageHeader back="/unidades/12" title={s.name} subtitle={group.name} />
      <div className="card overflow-hidden">
        {s.rows.map(([k, v], i) => (
          <div key={k} className={`grid gap-1 p-4 md:grid-cols-[220px_1fr] md:gap-4 ${i % 2 ? "bg-[var(--surface-2)]" : ""}`}>
            <p className="text-sm font-black uppercase tracking-wide text-sky">{k}</p>
            <p className="font-semibold">{v}</p>
          </div>
        ))}
      </div>
      {cases.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-black">Casos clínicos relacionados ({cases.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {cases.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
