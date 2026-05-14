export type VocabularyCollectionType = 'topic' | 'exam_set';

export interface VocabularyTopic {
  id: string;
  title: string;
  category: string;
  collectionType: VocabularyCollectionType;
  description: string;
  progress: number;
  wordCount: number;
  badge?: string;
  isNew?: boolean;
  featured?: boolean;
  sets?: string;
  level: 'Core' | 'Intermediate' | 'Advanced';
}

export interface Word {
  id: string;
  term: string;
  phonetic: string;
  audio?: string;
  definition: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech: string;
  collocations?: string[];
  synonyms?: string[];
}

export interface VocabularyDetailData extends VocabularyTopic {
  words: Word[];
}
