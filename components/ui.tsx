"use client";

import Link from "next/link";

export function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="animate-bounce text-6xl">🧠</div>
      <p className="text-xl font-black text-brand">PsicoLingo</p>
    </div>
  );
}

export function Bar({ value, color = "var(--color-brand)", className = "" }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-4 w-full overflow-hidden rounded-full bg-[var(--line)] ${className}`}>
      <div
        className="relative h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      >
        {value > 8 && <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: string; right?: React.ReactNode }) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {back && (
        <Link href={back} aria-label="Volver" className="btn btn-ghost !px-3 !py-2 text-lg">
          ←
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black leading-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="muted mt-1 font-semibold">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Stat({ icon, value, label, color }: { icon: string; value: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="card flex items-center gap-3 p-3">
      <span className="text-2xl">{icon}</span>
      <div className="min-w-0">
        <div className="text-lg font-black leading-none" style={{ color }}>
          {value}
        </div>
        <div className="muted text-xs font-bold">{label}</div>
      </div>
    </div>
  );
}

export function Mascot({ text, emoji = "🧠" }: { text: React.ReactNode; emoji?: string }) {
  return (
    <div className="flex items-end gap-3">
      <div className="text-5xl drop-shadow-sm">{emoji}</div>
      <div className="card relative mb-3 flex-1 p-3 font-bold">
        {text}
        <span className="absolute -left-2 bottom-3 h-3 w-3 rotate-45 border-b-2 border-l-2 border-[var(--line)] bg-[var(--surface)]" />
      </div>
    </div>
  );
}

export function Empty({ emoji, title, text, action }: { emoji: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      <div className="text-5xl">{emoji}</div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="muted max-w-sm font-semibold">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
