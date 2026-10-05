"use client";

import { PracticeSetup } from "@/components/practice-setup";
import { ALL_TERMS } from "@/lib/data/units";
import { randomTermQuestion, sample } from "@/lib/quiz";

export default function TestPage() {
  return (
    <PracticeSetup
      title="Test rápido"
      icon="✅"
      kind="test"
      subtitle="10 preguntas de opción múltiple: definición ↔ término."
      build={(unit) => sample(ALL_TERMS.filter((t) => !unit || t.unitId === unit), 10).map(randomTermQuestion)}
    />
  );
}
