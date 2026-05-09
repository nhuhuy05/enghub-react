import apiClient from '@/api/apiClient';
import type { VocabularyTopic, VocabularyDetailData } from '../types';

export const vocabularyService = {
  getTopics: async (): Promise<VocabularyTopic[]> => {
    // Mocking API call for now to keep the interface consistent
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Business',
            category: 'Chủ đề phổ biến',
            description: '500 từ vựng chuyên ngành tài chính, kinh doanh.',
            progress: 65,
            wordCount: 500,
            badge: 'Mới',
            isNew: true,
          },
          {
            id: '2',
            title: 'Travel',
            category: 'Chủ đề phổ biến',
            description: '320 từ vựng du lịch, đặt phòng, di chuyển.',
            progress: 40,
            wordCount: 320,
          },
          {
            id: '3',
            title: 'ETS 2024 Series',
            category: 'Theo bộ đề ETS',
            description: 'Trọn bộ từ vựng xuất hiện trong 10 đề thi thật mới nhất của ETS 2024.',
            progress: 0,
            wordCount: 850,
            featured: true,
            sets: '10',
          },
        ]);
      }, 500);
    });
  },

  getTopicDetail: async (id: string): Promise<VocabularyDetailData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          title: 'Business',
          category: 'Chủ đề phổ biến',
          description: '500 từ vựng chuyên ngành tài chính, kinh doanh.',
          progress: 65,
          wordCount: 500,
          words: [
            {
              id: 'w1',
              term: 'Agile',
              phonetic: '/ˈædʒ.aɪl/',
              audio: '',
              definition: 'Nhanh nhẹn, linh hoạt.',
              example: 'The company is moving towards a more agile way of working.',
              exampleTranslation: 'Công ty đang hướng tới cách làm việc linh hoạt hơn.',
              partOfSpeech: 'adj',
            },
            {
              id: 'w2',
              term: 'Backlog',
              phonetic: '/ˈbæk.lɒɡ/',
              audio: '',
              definition: 'Công việc tồn đọng.',
              example: 'We have a huge backlog of work to catch up on.',
              exampleTranslation: 'Chúng tôi có một khối lượng lớn công việc tồn đọng cần phải giải quyết.',
              partOfSpeech: 'n',
            }
          ],
        });
      }, 500);
    });
  },
};
