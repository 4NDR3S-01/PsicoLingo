import { CASES } from "./data/cases";
import { ALL_TERMS, UNITS } from "./data/units";

export type HistoryEntry = {
  id: string;
  at: string;
  kind: "quiz" | "caso" | "flashcards" | "emparejar" | "test" | "sintomas" | "examen" | "repaso";
  title: string;
  score: number;
  total: number;
  xp: number;
};

export type TermStat = { c: number; w: number; box: number; due: string };

export type Progress = {
  xp: number;
  streak: number;
  bestStreak: number;
  lastActive: string | null;
  dailyGoal: number;
  activity: Record<string, number>;
  history: HistoryEntry[];
  units: Record<string, { best: number; read: boolean }>;
  cases: Record<string, { ok: boolean; at: string }>;
  terms: Record<string, TermStat>;
  exams: { at: string; score: number; total: number; seconds: number }[];
  perfects: number;
  settings: { dark: boolean; avatar: string; sound: boolean };
};

export const emptyProgress = (): Progress => ({
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  dailyGoal: 50,
  activity: {},
  history: [],
  units: {},
  cases: {},
  terms: {},
  exams: [],
  perfects: 0,
  settings: { dark: false, avatar: "🧠", sound: true },
});

export const today = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return today(new Date(y, m - 1, d + n));
};

/** Racha vigente: si el último día activo fue antes de ayer, la racha se perdió. */
export function currentStreak(p: Progress) {
  if (!p.lastActive) return 0;
  const t = today();
  return p.lastActive === t || p.lastActive === addDays(t, -1) ? p.streak : 0;
}

export function awardXp(p: Progress, xp: number): Progress {
  const t = today();
  let streak = currentStreak(p);
  if (p.lastActive !== t) streak += 1;
  return {
    ...p,
    xp: p.xp + xp,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastActive: t,
    activity: { ...p.activity, [t]: (p.activity[t] ?? 0) + xp },
  };
}

export function addHistory(p: Progress, e: Omit<HistoryEntry, "id" | "at">): Progress {
  const entry: HistoryEntry = { ...e, id: crypto.randomUUID(), at: new Date().toISOString() };
  return { ...p, history: [entry, ...p.history].slice(0, 150) };
}

// Repaso espaciado (sistema Leitner): fallar devuelve el término a la caja 0.
const INTERVALS = [0, 1, 2, 4, 7, 15];

export function recordTerm(p: Progress, termId: string, ok: boolean): Progress {
  const prev = p.terms[termId] ?? { c: 0, w: 0, box: 0, due: today() };
  const box = ok ? Math.min(prev.box + 1, INTERVALS.length - 1) : 0;
  const next: TermStat = {
    c: prev.c + (ok ? 1 : 0),
    w: prev.w + (ok ? 0 : 1),
    box,
    due: addDays(today(), ok ? INTERVALS[box] : 0),
  };
  return { ...p, terms: { ...p.terms, [termId]: next } };
}

export function reviewQueue(p: Progress) {
  const t = today();
  return ALL_TERMS.filter((term) => {
    const s = p.terms[term.id];
    return s && s.w > 0 && s.due <= t && s.box < INTERVALS.length - 1;
  });
}

export const masteredCount = (p: Progress) =>
  Object.values(p.terms).filter((s) => s.box >= 3).length;

export function unitProgress(p: Progress, unitId: number) {
  const u = p.units[unitId] ?? { best: 0, read: false };
  const unitCases = CASES.filter((c) => c.unitId === unitId);
  const casesDone = unitCases.filter((c) => p.cases[c.id]?.ok).length;
  const unit = UNITS.find((x) => x.id === unitId)!;
  const termsSeen = unit.terms.filter((t) => p.terms[t.id]?.c).length / unit.terms.length;
  const read = u.read ? 1 : 0;
  if (!unitCases.length) return Math.round((read * 0.2 + (u.best / 100) * 0.5 + termsSeen * 0.3) * 100);
  return Math.round(
    (read * 0.15 + (u.best / 100) * 0.4 + termsSeen * 0.2 + (casesDone / unitCases.length) * 0.25) * 100,
  );
}

export const overallProgress = (p: Progress) =>
  Math.round(UNITS.reduce((acc, u) => acc + unitProgress(p, u.id), 0) / UNITS.length);

export const level = (xp: number) => Math.floor(xp / 200) + 1;
export const levelProgress = (xp: number) => (xp % 200) / 2;

export function weakTerms(p: Progress, n = 8) {
  return ALL_TERMS.map((t) => ({ t, s: p.terms[t.id] }))
    .filter((x) => x.s && x.s.w > 0)
    .sort((a, b) => b.s!.w - b.s!.c - (a.s!.w - a.s!.c) || b.s!.w - a.s!.w)
    .slice(0, n);
}

export function unitAccuracy(p: Progress) {
  return UNITS.map((u) => {
    let c = 0;
    let w = 0;
    for (const t of u.terms) {
      const s = p.terms[t.id];
      if (s) {
        c += s.c;
        w += s.w;
      }
    }
    return { unit: u, c, w, acc: c + w ? Math.round((c / (c + w)) * 100) : null };
  });
}

export type Achievement = { id: string; emoji: string; title: string; desc: string; ok: (p: Progress) => boolean };

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", emoji: "🌱", title: "Primer paso", desc: "Completa tu primera actividad", ok: (p) => p.history.length > 0 },
  { id: "xp100", emoji: "⭐", title: "100 XP", desc: "Acumula 100 XP", ok: (p) => p.xp >= 100 },
  { id: "xp500", emoji: "🌟", title: "500 XP", desc: "Acumula 500 XP", ok: (p) => p.xp >= 500 },
  { id: "xp2000", emoji: "💫", title: "2000 XP", desc: "Acumula 2000 XP", ok: (p) => p.xp >= 2000 },
  { id: "streak3", emoji: "🔥", title: "En racha", desc: "Racha de 3 días", ok: (p) => p.bestStreak >= 3 },
  { id: "streak7", emoji: "🚀", title: "Semana perfecta", desc: "Racha de 7 días", ok: (p) => p.bestStreak >= 7 },
  { id: "streak30", emoji: "🏆", title: "Imparable", desc: "Racha de 30 días", ok: (p) => p.bestStreak >= 30 },
  { id: "perfect", emoji: "💯", title: "Perfección", desc: "Termina un quiz sin errores", ok: (p) => p.perfects > 0 },
  { id: "cases10", emoji: "🩺", title: "Residente", desc: "Resuelve 10 casos clínicos", ok: (p) => Object.values(p.cases).filter((c) => c.ok).length >= 10 },
  { id: "cases50", emoji: "👩‍⚕️", title: "Clínico experto", desc: "Resuelve 50 casos clínicos", ok: (p) => Object.values(p.cases).filter((c) => c.ok).length >= 50 },
  { id: "exam", emoji: "📝", title: "Examinado", desc: "Completa un modo examen", ok: (p) => p.exams.length > 0 },
  { id: "exam80", emoji: "🎓", title: "Sobresaliente", desc: "Obtén 80% o más en un examen", ok: (p) => p.exams.some((e) => e.score / e.total >= 0.8) },
  { id: "master50", emoji: "🧠", title: "Memoria de elefante", desc: "Domina 50 términos", ok: (p) => masteredCount(p) >= 50 },
  { id: "allunits", emoji: "📚", title: "Explorador", desc: "Lee los conceptos de todas las unidades", ok: (p) => UNITS.every((u) => p.units[u.id]?.read) },
];
