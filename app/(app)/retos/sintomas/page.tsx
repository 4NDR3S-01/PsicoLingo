"use client";

import { PracticeSetup } from "@/components/practice-setup";
import { CASES } from "@/lib/data/cases";
import { caseQuestion, sample } from "@/lib/quiz";

const UNITS_WITH_CASES = [...new Set(CASES.map((c) => c.unitId))];

export default function SintomasPage() {
  return (
    <PracticeSetup
      title="Identificar síntomas"
      icon="🔎"
      kind="sintomas"
      units={UNITS_WITH_CASES}
      subtitle="Lee cada viñeta clínica e identifica la alteración o síndrome."
      build={(unit) => sample(CASES.filter((c) => !unit || c.unitId === unit), 8).map(caseQuestion)}
    />
  );
}
