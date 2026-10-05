"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui";

const GAMES = [
  { href: "/retos/flashcards", icon: "🃏", title: "Flashcards", desc: "Voltea la tarjeta, recuerda la definición y evalúate.", color: "#CE82FF" },
  { href: "/retos/emparejar", icon: "🧩", title: "Emparejar", desc: "Une cada término con su definición lo más rápido posible.", color: "#1CB0F6" },
  { href: "/retos/test", icon: "✅", title: "Test rápido", desc: "10 preguntas de opción múltiple sobre términos.", color: "#58CC02" },
  { href: "/retos/sintomas", icon: "🔎", title: "Identificar síntomas", desc: "Lee la viñeta e identifica la alteración o el síndrome.", color: "#FF4B4B" },
  { href: "/examen", icon: "📝", title: "Modo examen", desc: "Simulación cronometrada con preguntas de todo el temario.", color: "#FF9600" },
  { href: "/repaso", icon: "🔄", title: "Repaso espaciado", desc: "Los términos que fallaste reaparecen hasta dominarlos.", color: "#2B70C9" },
];

export default function Retos() {
  return (
    <div>
      <PageHeader title="Retos" subtitle="Elige cómo quieres practicar hoy." />
      <div className="grid gap-4 md:grid-cols-2">
        {GAMES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group flex items-center gap-4 rounded-3xl border-2 border-b-[6px] border-[var(--line)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl transition group-hover:scale-110" style={{ background: `${g.color}22` }}>
              {g.icon}
            </span>
            <div>
              <h3 className="text-lg font-black" style={{ color: g.color }}>
                {g.title}
              </h3>
              <p className="muted text-sm font-semibold">{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
