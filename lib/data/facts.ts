import { today } from "../progress";

export const FACTS = [
  "La Ley de Ribot establece que los recuerdos más recientes y menos organizados son los más vulnerables a perderse.",
  "\"Alexitimia\" significa etimológicamente \"falta de palabras para los afectos\".",
  "Emil Kraepelin demostró la obediencia automática: el paciente sigue sacando la lengua aunque cada vez reciba un pinchazo.",
  "En la flexibilidad cérea, mover el cuerpo del paciente se siente como doblar una varilla de cera blanda: mantiene la postura final.",
  "La almohada psicológica consiste en sostener la cabeza en el aire, sin apoyo y sin cansancio aparente.",
  "En el síndrome amnésico de Korsakoff, la orientación está sorprendentemente conservada pese a la grave amnesia de fijación.",
  "El síndrome oniroide se acompaña de \"beatífica complacencia\": el paciente vive escenas como una película sin angustia.",
  "La alucinación liliputiense hace ver objetos diminutos; la guliveriana, enormes. Ambos nombres vienen de Los viajes de Gulliver.",
  "La rumiación mira al pasado y al presente; la preocupación (worry) mira al futuro.",
  "Las ideas deliroides se parecen a las delirantes, pero el paciente puede reconsiderarlas al razonar.",
  "El delirio de negación puede conferir al paciente una paradójica sensación de \"inmortalidad\".",
  "En la pareidolia se da significado a un estímulo ambiguo, como ver caras en las nubes.",
  "La cataplejía de la narcolepsia suele desencadenarse por emociones intensas como la risa, sin pérdida de conciencia.",
  "Las pesadillas ocurren en sueño REM y se recuerdan; los terrores nocturnos ocurren en fases III-IV y no se recuerdan.",
  "La interceptación cinética se parece a una película a la que se le pone pausa y luego play.",
  "En la autoscopia negativa, la persona no se ve reflejada en el espejo.",
  "En la alucinosis, a diferencia de la alucinación, la persona sabe que lo que percibe no existe.",
  "La autorreferencia no debe confundirse con el delirio de referencia: es solo llevar el discurso hacia uno mismo.",
  "En el estado crepuscular hay amnesia total del episodio al concluir; suele asociarse a epilepsia del lóbulo temporal.",
  "Las estereotipias son reforzantes en sí mismas y carecen de objetivo; las compulsiones buscan reducir la ansiedad.",
  "La hipobulia permite hacer las cosas, aunque con lentitud; en la abulia el paciente ni siquiera las inicia.",
  "La disociación ideoafectiva —reaccionar con una emoción opuesta a la esperada— es característica de la esquizofrenia.",
  "La moria es una alegría \"insulsa\" o \"sosa\", sin sentido, que se observa en tumoraciones cerebrales.",
  "En el síndrome paranoico el delirio es único y con argumentación lógica, sin alucinaciones.",
];

export function factOfTheDay() {
  const t = today();
  let h = 0;
  for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FACTS[h % FACTS.length];
}
