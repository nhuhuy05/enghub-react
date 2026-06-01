import part7Data from '../data/part7.json';
import type { ReadingPassageDetail, ReadingPassageSummary } from '../types';

const part7 = part7Data as ReadingPassageDetail[];

const abortError = () => new DOMException('Reading request aborted', 'AbortError');

const delay = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timeoutId = window.setTimeout(resolve, ms);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(abortError());
      },
      { once: true },
    );
  });
};

const toPassageSummary = (passage: ReadingPassageDetail): ReadingPassageSummary => ({
  id: passage.id,
  title: passage.title,
  description: passage.description,
  passageGroup: passage.passageGroup,
  documentTypes: passage.documentTypes,
  questionCount: passage.questions.length,
  sectionCount: passage.sections.length,
});

const findPassage = (passageId: string): ReadingPassageDetail | undefined => {
  return part7.find((item) => item.id === passageId);
};

export const readingService = {
  getPassages: async (signal?: AbortSignal): Promise<ReadingPassageSummary[]> => {
    await delay(400, signal);
    return part7.map(toPassageSummary);
  },

  getPassage: async (passageId: string, signal?: AbortSignal): Promise<ReadingPassageDetail> => {
    await delay(400, signal);
    const passage = findPassage(passageId);
    if (!passage) throw new Error('Reading passage not found');
    return passage;
  },
};
