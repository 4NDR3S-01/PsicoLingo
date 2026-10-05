export type Syndrome = {
  id: string;
  name: string;
  group: string;
  rows: [string, string][];
};

export const SYNDROME_GROUPS = [
  {
    id: "agudos",
    name: "Síndromes Cerebrales Orgánicos Agudos",
    concepts: [
      "Afectación funcional, comienzo brusco",
      "Trastornos de funciones de síntesis y cognoscitivas",
      "Afectación del nivel de vigilia como síntoma cardinal",
      "Evolución a curación o deterioro irreversible/muerte",
    ],
  },
  {
    id: "cronicos",
    name: "Síndromes Cerebrales Orgánicos Crónicos",
    concepts: [
      "Alteraciones del nivel de vigilia o sensopercepciones no existen o son despreciables",
      "Afectación de capacidades intelectuales y del carácter",
      "Desorganización de la personalidad",
      "Reversión escasa o nula",
    ],
  },
  {
    id: "afectivos",
    name: "Síndromes Esquizofrénicos, Delirantes y Afectivos",
    concepts: [],
  },
  {
    id: "otros",
    name: "Síndromes Discinéticos, Hipocondríaco, Asténico y Psicopático",
    concepts: [],
  },
];

const DG = "Descripción general";
const FS = "Funciones de síntesis";
const FR = "Funciones de relación";
const CI = "Capacidades intelectuales";
const FC = "Funciones cognoscitivas";
const FA = "Funciones afectivas";
const CO = "Conducta";
const FN = "Funciones conativas";

export const SYNDROMES: Syndrome[] = [
  {
    id: "obnubilacion",
    name: "Síndrome de Obnubilación",
    group: "agudos",
    rows: [
      [DG, "Enfermo tranquilo, hipomímico, descuido en hábitos"],
      [FS, "Vigilia baja, atención distráctil, memoria disminuida, orientación grosera"],
      [FR, "Afectadas globalmente"],
      [CI, "Disminuidas"],
      [FC, "Sin síntomas productivos, necesita estímulos fuertes, pensamiento lento"],
      [FA, "Indiferencia"],
      [CO, "Abulia e hipoquinesia"],
    ],
  },
  {
    id: "delirium",
    name: "Síndrome de Delirium",
    group: "agudos",
    rows: [
      [DG, "Paciente agitado, sudoroso, tembloroso"],
      [FS, "Vigilia baja, atención distráctil, memoria disminuida con evocación residual, comprensión disminuida, orientación fluctuante"],
      [FR, "Afectadas globalmente"],
      [CI, "Disminuidas"],
      [FC, "Riqueza alucinatoria visual y táctil (animales repugnantes, temas cósmicos), pensamiento disgregado y perseverante"],
      [FA, "Variables, ansiedad y terror"],
      [CO, "Agitación a grandes espacios, temblores significativos (delirium alcohólico)"],
    ],
  },
  {
    id: "oniroide",
    name: "Síndrome Oniroide",
    group: "agudos",
    rows: [
      [DG, "Actitud contemplativa, hipomímico, descuido de hábitos"],
      [FS, "Vigilia baja, atención distráctil excepto en vivencias alucinatorias, memoria disminuida, orientación alopsíquica tomada, autopsíquica conservada"],
      [FR, "Globalmente afectadas, comprensión disminuida"],
      [CI, "Disminuidas"],
      [FC, "Alucinaciones visuales escénicas no angustiosas, pensamiento disgregado, divagante, lento"],
      [FA, "Beatífica complacencia"],
      [CO, "Contemplativa, inmóvil"],
    ],
  },
  {
    id: "crepuscular",
    name: "Síndrome de Estado Crepuscular",
    group: "agudos",
    rows: [
      [DG, "Enfermo agitado, sudoroso, agresivo"],
      [FS, "Nivel de vigilia muy bajo, atención distráctil, amnesia total al concluir, comprensión disminuida, desorientación total sin fluctuaciones"],
      [FR, "Toma de las funciones de relación"],
      [CI, "Toma de capacidades intelectuales"],
      [FC, "Alucinaciones visuales terroríficas, pensamiento y lenguaje prácticamente nulos"],
      [FA, "Agresividad, ansiedad, pánico"],
      [CO, "Agresiva, destructiva, fugitiva"],
    ],
  },
  {
    id: "confusion",
    name: "Síndrome de Confusión Mental",
    group: "agudos",
    rows: [
      [DG, "Agitación limitada a su cama, movimientos carfológicos"],
      [FS, "Vigilia a punto de abolirse, atención muy distráctil, memoria abolida, comprensión abolida, desorientación total sin fluctuaciones"],
      [FR, "Abolidas"],
      [CI, "Prácticamente nulas"],
      [FC, "Ilusiones visuales inferidas por observación, pensamiento incoherente"],
      [FA, "Indiferencia"],
      [CO, "Agitación limitada, repite movimientos propios de su trabajo"],
    ],
  },
  {
    id: "oligofrenico",
    name: "Síndrome Oligofrénico",
    group: "cronicos",
    rows: [
      [DG, "Frecuentemente distraído, descuidado en su presencia"],
      [FS, "Vigilia normal, atención distráctil, memoria aumentada mecánicamente, desorientación solo en casos graves"],
      [FR, "Afectadas globalmente, comparables a las de un niño"],
      [CI, "Muy disminuidas"],
      [FC, "Sin alteraciones sensoperceptivas, pensamiento concreto"],
      [FA, "Respuestas infantiles: intolerancia a frustraciones, incapacidad para posponer satisfacciones, cambios afectivos bruscos, dependencia, sugestionabilidad"],
      [CO, "Inconsistente y pueril, adaptación creadora limitada"],
    ],
  },
  {
    id: "demencial",
    name: "Síndrome Demencial",
    group: "cronicos",
    rows: [
      [DG, "Aspecto descuidado, comunicación limitada"],
      [FS, "Vigilia normal, atención distráctil, memoria muy tomada (fijación), desorientación en casos avanzados"],
      [FR, "Globalmente afectadas"],
      [CI, "Muy disminuidas"],
      [FC, "Pensamiento concreto, perseverante, prolijo, a veces delirante"],
      [FA, "Indiferencia o labilidad, explosividad"],
      [CO, "Afectación de hábitos, trastornos globales de necesidades"],
    ],
  },
  {
    id: "amnesico",
    name: "Síndrome Amnésico (Korsakoff)",
    group: "cronicos",
    rows: [
      [DG, "Aspecto descuidado, distraído"],
      [FS, "Vigilia normal, atención distráctil, memoria muy tomada (fijación reciente), confabulaciones, orientación conservada"],
      [CI, "Disminuidas"],
      [FC, "Pensamiento concreto, perseverante, prolijo"],
      [FA, "Apatía, labilidad o rigidez afectiva"],
      [CO, "Hipobulia o abulia, descuido de hábitos, alteración de necesidades"],
    ],
  },
  {
    id: "apatoabulico",
    name: "Síndrome Apatoabúlico",
    group: "cronicos",
    rows: [
      [DG, "Aspecto descuidado, facies indiferente"],
      [FS, "Vigilia normal, atención distráctil, hipomnesia, desorientación apática"],
      [FR, "Muy afectadas"],
      [CI, "Disminuidas"],
      [FC, "Síntomas residuales en percepciones y pensamiento, curso asociativo lentificado"],
      [FA, "Indiferencia"],
      [CO, "Abulia, hipoquinesia, toma de necesidades y hábitos"],
    ],
  },
  {
    id: "esquizofrenico",
    name: "Síndrome Esquizofrénico",
    group: "afectivos",
    rows: [
      ["Característica esencial", "Desorganización de funciones psíquicas, disociación ideoafectivoconativa"],
      [DG, "Aspecto descuidado, aislamiento, dificultades de comunicación"],
      [FS, "Vigilia normal, atención orientada, memoria sin alteraciones, orientación conservada"],
      [FR, "Afectación global"],
      [CI, "Sin gran alteración"],
      [FC, "Riqueza alucinatoria auditiva, pensamiento autista, bloqueo, disgregación"],
      [FA, "Disociación ideoafectiva, ambivalencia afectiva"],
      [FN, "Abulia, conducta incomprensible"],
    ],
  },
  {
    id: "paranoico",
    name: "Síndrome Paranoico",
    group: "afectivos",
    rows: [
      [DG, "Presencia y comunicación conservadas"],
      [FS, "Vigilia normal, atención a veces hipervigilante, memoria conservada/aumentada, orientación conservada"],
      [FR, "Afectadas en lo relativo al tema delirante"],
      [CI, "Normales o altas"],
      [FC, "Sin trastornos sensoperceptivos, delirio único con argumentación lógica"],
      [FA, "Conservadas excepto en lo relativo al delirio"],
      [FN, "Hábitos conservados"],
    ],
  },
  {
    id: "paranoide",
    name: "Síndrome Paranoide",
    group: "afectivos",
    rows: [
      [DG, "Aspecto descuidado, actitud recelosa"],
      [FS, "Vigilia normal, atención hipervigilante, memoria conservada, orientación conservada"],
      [FR, "Globalmente afectadas"],
      [CI, "Conservadas"],
      [FC, "Alucinaciones auditivas verbales, ilusiones auditivas, ideas delirantes de daño, persecución, referencia, grandeza o celos"],
      [FA, "Ansiedad, agresividad"],
      [FN, "Conducta concordante con el delirio, afectación de necesidades y hábitos"],
    ],
  },
  {
    id: "automatismo",
    name: "Síndrome de Automatismo Psíquico",
    group: "afectivos",
    rows: [
      [DG, "Aspecto descuidado"],
      [FS, "Vigilia normal, atención dirigida hacia adentro, memoria conservada, orientación conservada"],
      [FR, "Globalmente afectada"],
      [CI, "Conservadas"],
      [FC, "Pseudoalucinaciones auditivas, trastorno del esquema corporal, despersonalización, desrealización, pensamiento autista, bloqueo, delirio de influencia, delirio de robo del pensamiento"],
      [FA, "Apatía, disociación ideoafectiva"],
      [FN, "Hipobulia, alteración de necesidades y hábitos"],
    ],
  },
  {
    id: "maniaco",
    name: "Síndrome Maníaco",
    group: "afectivos",
    rows: [
      [DG, "Aspecto llamativo por vestuario y maquillaje exagerado"],
      [FS, "Vigilia algo aumentada, atención hipervigilante, memoria aumentada, orientación conservada"],
      [FR, "Globalmente afectada"],
      [CI, "Conservadas"],
      [FC, "Sensopercepciones sin alteraciones, pensamiento acelerado, fuga de ideas"],
      [FA, "Hipertimia, labilidad afectiva, disforia"],
      [FN, "Hiperbulia, hiperquinesia improductiva, aumento de necesidades (bulimia, hipererotismo, hipersociabilidad)"],
    ],
  },
  {
    id: "depresivo",
    name: "Síndrome Depresivo",
    group: "afectivos",
    rows: [
      [DG, "Aspecto descuidado, postura flexionada"],
      [FS, "Vigilia normal, atención hiperconcentrada, memoria disminuida, orientación conservada"],
      [FR, "Minusvalía, retraimiento, reducción de intereses"],
      [CI, "Conservadas"],
      [FC, "Sensopercepciones sin alteraciones, pensamiento de curso lento, ideas hipocondríacas, ideas delirantes e ideas suicidas en casos severos"],
      [FA, "Hipotimia, ansiedad"],
      [FN, "Hipobulia, hipoquinesia, alteración de hábitos, insomnio, anorexia, hipoerotismo, aislamiento social"],
    ],
  },
  {
    id: "ansioso",
    name: "Síndrome Afectivo Ansioso",
    group: "afectivos",
    rows: [
      [DG, "Aspecto angustiado, pupilas dilatadas, manos frías y sudorosas"],
      [FS, "Vigilia normal o alta, atención discretamente hipervigilante, memoria algo disminuida, orientación conservada"],
      [FR, "Conservadas"],
      [CI, "Conservadas"],
      [FC, "Cenestopatías ocasionales, pensamiento acelerado, temor a enloquecer o morir"],
      [FA, "Ansiedad, irritabilidad, disforia"],
      [FN, "Hiperbulia, hiperquinesia, insomnio vespertino"],
      ["Manifestaciones vegetativas", "Taquicardia, palpitaciones, hiperhidrosis palmar, piloerección, crisis vasculares, hipermotilidad intestinal"],
    ],
  },
  {
    id: "estuporoso",
    name: "Síndrome Estuporoso",
    group: "otros",
    rows: [
      [DG, "Aspecto descuidado"],
      [FS, "Vigilia normal o baja, atención hiperconcentrada, memoria normal o disminuida, orientación variable"],
      [FR, "Globalmente afectadas"],
      [CI, "Conservadas"],
      [FC, "Sin alteraciones específicas"],
      [FA, "Facies puede expresar pánico, indiferencia, perplejidad o tristeza"],
      [CO, "Abulia, acinesia, alteración total de necesidades y hábitos"],
      ["Estupor histriónico", "Teatralidad, risa y llanto fluctuantes, noxa reciente, ganancia evidente"],
      ["Estupor situacional", "No antecedentes patológicos, situación de gran significado, facies de pánico, sudorosa, no ganancia"],
      ["Estupor depresivo", "Inmovilidad total, mutismo, negativismo pasivo, facies de tristeza marcada, quejidos, lágrimas espontáneas"],
      ["Estupor catatónico", "Inmovilidad, negativismo, mutismo, flexibilidad cérea, retención urinaria, sialorrea, actividad delirante y alucinatoria"],
      ["Estupor orgánico", "Estado de toma de conciencia confusional, amnesia de las crisis"],
    ],
  },
  {
    id: "hipocondriaco",
    name: "Síndrome Hipocondríaco",
    group: "otros",
    rows: [
      [DG, "Comunicación desarrollada en terminología médica"],
      [FS, "Vigilia normal, atención dirigida a funciones corporales con hiperconcentración, memoria conservada, orientación conservada"],
      [CI, "Normales"],
      [FC, "Cenestopatías, alucinaciones y delirios en casos severos"],
      [FA, "Ansiedad, hipotimia"],
      [CO, "Reiteradas visitas al médico sin justificación, discreta toma de necesidades"],
    ],
  },
  {
    id: "astenico",
    name: "Síndrome Asténico",
    group: "otros",
    rows: [
      [DG, "Aspecto expresivo de cansancio"],
      [FS, "Vigilia normal, atención discretamente distráctil, hipomnesia de fijación y evocación, orientación normal"],
      [FR, "Conservadas"],
      [CI, "Conservadas"],
      [FC, "Hiperestesia, cenestopatías, torpeza asociativa"],
      [FA, "Irritabilidad y disforia"],
      [CO, "Agotamiento fácil, sueño físico, disfunciones sexuales"],
    ],
  },
  {
    id: "psicopatico",
    name: "Síndrome Psicopático",
    group: "otros",
    rows: [
      [DG, "No específico"],
      [FS, "Sin alteraciones"],
      [FR, "Patrones inadaptativos en relaciones consigo mismo, con los demás y con las cosas"],
      [CI, "Conservadas"],
      [FC, "Sin alteraciones específicas"],
      [FA, "Inseguridad, labilidad"],
      [CO, "Dificultades en control de impulsos, dificultades sexuales"],
    ],
  },
];

export const getSyndrome = (id: string) => SYNDROMES.find((s) => s.id === id);
