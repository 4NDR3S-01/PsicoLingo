"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { QuizRunner, type RunResult } from "@/components/quiz-runner";
import { getUnit } from "@/lib/data/units";
import type { Progress } from "@/lib/progress";
import { unitQuiz } from "@/lib/quiz";

export default function UnitQuiz() {
  const { id } = useParams<{ id: string }>();
  const unit = getUnit(Number(id))!;
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState(() => unitQuiz(unit));

  const onFinish = useCallback(
    (r: RunResult, p: Progress): Progress => {
      const pct = Math.round((r.correct / r.total) * 100);
      const prev = p.units[unit.id] ?? { best: 0, read: false };
      return { ...p, units: { ...p.units, [unit.id]: { ...prev, best: Math.max(prev.best, pct) } } };
    },
    [unit.id],
  );

  return (
    <QuizRunner
      key={round}
      title={`Quiz · ${unit.short}`}
      questions={questions}
      exitHref={`/unidades/${unit.id}`}
      kind="quiz"
      onFinish={onFinish}
      onRestart={() => {
        setQuestions(unitQuiz(unit));
        setRound((r) => r + 1);
      }}
    />
  );
}
