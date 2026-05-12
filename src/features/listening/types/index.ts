export type ListeningMode = 'check' | 'dictation' | 'full';
export type ListeningHintLevel = 30 | 50 | 100;
export type RevealAmount = 1 | 2 | 3 | 'all';

export interface ListeningPart {
  id: string;
  name: string;
  title: string;
  description: string;
  questionsCount: number;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  accent: string;
}

export interface ListeningTest {
  id: string;
  collection: string;
  name: string;
  title: string;
  description: string;
  progress: number;
  totalQuestions: number;
  estimatedMinutes: number;
  parts: ListeningPart[];
  isNew?: boolean;
}

export interface ListeningSentence {
  id: string;
  text: string;
  translation: string;
  audioUrl: string;
  completed: boolean;
  hintLevels: ListeningHintLevel[];
}

export interface ListeningExerciseGroup {
  id: string;
  title: string;
  sentences: ListeningSentence[];
}

export interface ListeningSession {
  testId: string;
  partId: string;
  title: string;
  partName: string;
  instruction: string;
  audioUrl: string;
  duration: number;
  vocabulary: Array<{
    term: string;
    meaning: string;
  }>;
  groups: ListeningExerciseGroup[];
}
