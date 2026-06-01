export type ReadingPassageGroup = 'single' | 'double' | 'triple';

export type ReadingDocumentType = 'email' | 'notice' | 'schedule' | 'form';

export interface ReadingPassageLine {
  id: string;
  text: string;
  translation: string;
}

export interface ReadingVocabularyItem {
  term: string;
  meaning: string;
  example?: string;
}

export interface ReadingPassageSection {
  id: string;
  title: string;
  documentType: ReadingDocumentType;
  lines: ReadingPassageLine[];
}

export interface ReadingAnswerOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ReadingQuestion {
  id: string;
  number: number;
  prompt: string;
  translation: string;
  options: ReadingAnswerOption[];
  correctAnswer: ReadingAnswerOption['id'];
  explanation: string;
  explanationVi: string;
}

export interface ReadingPassageSummary {
  id: string;
  title: string;
  description: string;
  passageGroup: ReadingPassageGroup;
  documentTypes: ReadingDocumentType[];
  questionCount: number;
  sectionCount: number;
}

export interface ReadingPassageDetail {
  id: string;
  title: string;
  description: string;
  passageGroup: ReadingPassageGroup;
  documentTypes: ReadingDocumentType[];
  sections: ReadingPassageSection[];
  vocabulary: ReadingVocabularyItem[];
  questions: ReadingQuestion[];
}
