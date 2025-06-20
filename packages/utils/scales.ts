export type ScaleDefinition = {
  questions: { id: string; text: string; options: { label: string; value: number }[] }[];
  scoring: (answers: Record<string, number>) => number;
};

export const SCALES: Record<string, ScaleDefinition> = {
  'PHQ-9': {
    questions: [
      { id: 'q1', text: 'Scarso interesse o piacere nel fare le cose', options: [
        { label: 'Mai', value: 0 },
        { label: 'Alcuni giorni', value: 1 },
        { label: 'Più della metà dei giorni', value: 2 },
        { label: 'Quasi ogni giorno', value: 3 },
      ] },
      { id: 'q2', text: 'Sensazione di depressione o disperazione', options: [
        { label: 'Mai', value: 0 },
        { label: 'Alcuni giorni', value: 1 },
        { label: 'Più della metà dei giorni', value: 2 },
        { label: 'Quasi ogni giorno', value: 3 },
      ] },
      // ...altre 7 domande PHQ-9...
    ],
    scoring: (answers) => Object.values(answers).reduce((a, b) => a + b, 0),
  },
  'GAD-7': {
    questions: [
      { id: 'q1', text: 'Sensazione di nervosismo, ansia o tensione', options: [
        { label: 'Mai', value: 0 },
        { label: 'Alcuni giorni', value: 1 },
        { label: 'Più della metà dei giorni', value: 2 },
        { label: 'Quasi ogni giorno', value: 3 },
      ] },
      // ...altre 6 domande GAD-7...
    ],
    scoring: (answers) => Object.values(answers).reduce((a, b) => a + b, 0),
  },
  'WHODAS-2.0': {
    questions: [
      { id: 'q1', text: 'Difficoltà a concentrarsi o ricordare le cose', options: [
        { label: 'Nessuna', value: 0 },
        { label: 'Lieve', value: 1 },
        { label: 'Moderata', value: 2 },
        { label: 'Grave', value: 3 },
        { label: 'Estrema', value: 4 },
      ] },
      // ...altre domande WHODAS-2.0...
    ],
    scoring: (answers) => Object.values(answers).reduce((a, b) => a + b, 0),
  },
  'DSM-5-CC': {
    questions: [
      { id: 'q1', text: 'Problemi con il sonno', options: [
        { label: 'Mai', value: 0 },
        { label: 'Raramente', value: 1 },
        { label: 'A volte', value: 2 },
        { label: 'Spesso', value: 3 },
        { label: 'Quasi sempre', value: 4 },
      ] },
      // ...altre domande DSM-5-CC...
    ],
    scoring: (answers) => Object.values(answers).reduce((a, b) => a + b, 0),
  },
}; 