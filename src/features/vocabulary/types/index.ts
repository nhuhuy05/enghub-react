export interface VocabularyTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  progress: number;
  wordCount: number;
  icon?: any;
  iconBg?: string;
  iconColor?: string;
  badge?: string;
  isNew?: boolean;
  featured?: boolean;
  sets?: string;
}

export interface Word {
  id: string;
  term: string;
  phonetic: string;
  audio: string;
  definition: string;
  example: string;
  exampleTranslation: string;
  imageUrl?: string;
  partOfSpeech: string;
}

export interface VocabularyDetailData extends VocabularyTopic {
  words: Word[];
}
