export type LearningModule = {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: string[];
  published: boolean;
};

export type AssessmentQuestion = {
  question: string;
  choices: string[];
  correct: number;
};

export const INITIAL_MODULES: LearningModule[] = [
  {
    id: 'foundations',
    title: 'Fundamentos del juego',
    level: 'Principiante',
    description: 'Conoce el equipo, las reglas y las bases de una sesión segura.',
    lessons: ['Postura y agarre', 'Reglas del bowling', 'Cómo contar una partida', 'Aproximación de 4 pasos', 'Péndulo y suelta', 'Lectura de pista'],
    published: true,
  },
  {
    id: 'technique',
    title: 'Técnica de lanzamiento',
    level: 'Intermedio',
    description: 'Trabaja aproximación, péndulo, suelta y seguimiento.',
    lessons: ['Postura y agarre', 'Aproximación de 4 pasos', 'Péndulo y suelta', 'Conversión de spares', 'Lectura de pista', 'Rutina de competencia'],
    published: true,
  },
  {
    id: 'strategy',
    title: 'Estrategia avanzada',
    level: 'Avanzado',
    description: 'Lee los cambios de pista y adapta la línea de juego.',
    lessons: ['Lectura de pista', 'Ajustes de línea', 'Rutina de competencia', 'Táctica de spares', 'Control de velocidad', 'Preparación de torneo'],
    published: false,
  },
];

export const INITIAL_ASSESSMENT: AssessmentQuestion[] = [
  { question: '¿Cuántos pinos debes derribar en el primer tiro para lograr un strike?', choices: ['8 pinos', '9 pinos', 'Los 10 pinos'], correct: 2 },
  { question: '¿Qué bonificación da un strike?', choices: ['El siguiente tiro', 'Los dos tiros siguientes', '10 puntos fijos'], correct: 1 },
  { question: '¿Qué bonificación da un spare?', choices: ['El siguiente tiro', 'Los dos tiros siguientes', 'Ninguna'], correct: 0 },
  { question: '¿Cuántos tiros puede incluir el décimo marco?', choices: ['2 como máximo', 'Siempre 2', 'Hasta 3 con bonificación', '10'], correct: 2 },
  { question: '¿Qué significa un marco abierto?', choices: ['Strike en el primer tiro', 'Quedan pinos tras dos tiros', 'Spare en el segundo tiro'], correct: 1 },
];

export const APPROACH_CHAPTERS = [
  { title: 'La salida', body: 'Coloca los pies en tu punto de partida, alinea hombros y mirada con la flecha objetivo. Respira y fija una rutina que puedas repetir.', cue: 'Mira la flecha, no los pinos.' },
  { title: 'El péndulo', body: 'Deja que el brazo acompañe el movimiento de la bola. Mantén el hombro suelto y evita forzar la dirección desde la muñeca.', cue: 'Brazo relajado; movimiento libre.' },
  { title: 'Los cuatro pasos', body: 'Avanza con un ritmo natural y constante. Coordina el impulso inicial de la bola con los pasos para que el último coincida con el deslizamiento.', cue: 'Ritmo constante de principio a fin.' },
  { title: 'La suelta', body: 'Desliza hacia la línea de falta, conserva el equilibrio y deja salir la bola cerca del tobillo. Termina con la mano siguiendo la línea elegida.', cue: 'Equilibrio primero; termina hacia el objetivo.' },
];