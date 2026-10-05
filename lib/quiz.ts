import { CASES, type ClinicalCase } from "./data/cases";
import { ALL_TERMS, UNITS, type Term, type Unit } from "./data/units";

export type Question = {
  id: string;
  kind: "def" | "term" | "quiz" | "case";
  prompt: string;
  context?: string;
  options: string[];
  answer: string;
  explain?: string;
  termId?: string;
  caseId?: number;
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

function pickDistractors(correct: string, pool: string[], fallback: string[], n = 3) {
  const seen = new Set([correct.toLowerCase()]);
  const out: string[] = [];
  for (const x of [...shuffle(pool), ...shuffle(fallback)]) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
    if (out.length === n) break;
  }
  return out;
}

const allTermNames = ALL_TERMS.map((t) => t.term);

/** Muestra la definición y pide elegir el término. */
export function defQuestion(t: Term): Question {
  const unit = UNITS.find((u) => u.id === t.unitId)!;
  const options = shuffle([
    t.term,
    ...pickDistractors(t.term, unit.terms.map((x) => x.term), allTermNames),
  ]);
  return {
    id: `def-${t.id}-${Math.random()}`,
    kind: "def",
    prompt: "¿Qué término corresponde a esta definición?",
    context: t.def,
    options,
    answer: t.term,
    termId: t.id,
    explain: `${t.term}: ${t.def}`,
  };
}

/** Muestra el término y pide elegir la definición. */
export function termQuestion(t: Term): Question {
  const unit = UNITS.find((u) => u.id === t.unitId)!;
  const options = shuffle([
    t.def,
    ...pickDistractors(t.def, unit.terms.map((x) => x.def), ALL_TERMS.map((x) => x.def)),
  ]);
  return {
    id: `term-${t.id}-${Math.random()}`,
    kind: "term",
    prompt: `¿Qué significa "${t.term}"?`,
    options,
    answer: t.def,
    termId: t.id,
    explain: `${t.term}: ${t.def}`,
  };
}

export const randomTermQuestion = (t: Term) => (Math.random() < 0.6 ? defQuestion(t) : termQuestion(t));

export function unitQuiz(unit: Unit, size = 10): Question[] {
  const base: Question[] = unit.quiz.map((q, i) => {
    const term = unit.terms.find((t) => t.term === q.a);
    return {
      id: `quiz-${unit.id}-${i}`,
      kind: "quiz",
      prompt: q.q,
      options: shuffle([q.a, ...pickDistractors(q.a, unit.terms.map((t) => t.term), allTermNames)]),
      answer: q.a,
      termId: term?.id,
      explain: term ? `${term.term}: ${term.def}` : undefined,
    };
  });
  const rest = sample(unit.terms, Math.max(0, size - base.length)).map(randomTermQuestion);
  return shuffle([...base, ...rest]);
}

const caseAnswers = CASES.map((c) => c.qa[0].a);

export function caseQuestion(c: ClinicalCase): Question {
  const sameUnit = CASES.filter((x) => x.unitId === c.unitId && x.id !== c.id).map((x) => x.qa[0].a);
  return {
    id: `case-${c.id}-${Math.random()}`,
    kind: "case",
    prompt: c.qa[0].q,
    context: c.vignette,
    options: shuffle([c.qa[0].a, ...pickDistractors(c.qa[0].a, sameUnit, caseAnswers)]),
    answer: c.qa[0].a,
    caseId: c.id,
    explain: c.qa.slice(1).map((x) => `${x.q} → ${x.a}`).join("\n"),
  };
}

/** Preguntas de seguimiento de un caso (2.ª y 3.ª pregunta). */
export function caseFollowUps(c: ClinicalCase): Question[] {
  return c.qa.slice(1).map((qa, i) => {
    const pool = CASES.flatMap((x) => x.qa.slice(1).filter((y) => y.q === qa.q).map((y) => y.a));
    const fallback = CASES.flatMap((x) => x.qa.slice(1).map((y) => y.a));
    return {
      id: `case-${c.id}-f${i}`,
      kind: "case" as const,
      prompt: qa.q,
      context: c.vignette,
      options: shuffle([qa.a, ...pickDistractors(qa.a, pool, fallback)]),
      answer: qa.a,
      caseId: c.id,
    };
  });
}

export function examQuestions(n = 25): Question[] {
  const terms = sample(ALL_TERMS, Math.ceil(n * 0.6)).map(randomTermQuestion);
  const cases = sample(CASES, n - terms.length).map(caseQuestion);
  return shuffle([...terms, ...cases]);
}
