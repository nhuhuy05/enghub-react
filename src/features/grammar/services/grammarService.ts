import type { GrammarTopic, GrammarDetailData } from '../types';

const mockGrammarTopics: GrammarTopic[] = [
  { id: '1', title: 'Thì Hiện tại đơn', category: 'Các thì cơ bản', description: 'Cách dùng, cấu trúc và dấu hiệu nhận biết thì hiện tại đơn trong tiếng Anh.', progress: 100, lessonsCount: 5 },
  { id: '2', title: 'Thì Hiện tại tiếp diễn', category: 'Các thì cơ bản', description: 'Diễn tả hành động đang xảy ra tại thời điểm nói hoặc xung quanh thời điểm nói.', progress: 40, lessonsCount: 4, isNew: true },
  { id: '3', title: 'Danh từ đếm được và không đếm được', category: 'Từ loại', description: 'Phân biệt danh từ đếm được, không đếm được và cách dùng mạo từ đi kèm.', progress: 0, lessonsCount: 6 },
  { id: '4', title: 'Câu bị động (Passive Voice)', category: 'Cấu trúc câu', description: 'Chuyển đổi từ câu chủ động sang bị động và các trường hợp đặc biệt.', progress: 0, lessonsCount: 8 },
  { id: '5', title: 'Mệnh đề quan hệ', category: 'Cấu trúc câu', description: 'Cách dùng Who, Whom, Which, That, Whose trong mệnh đề quan hệ xác định và không xác định.', progress: 15, lessonsCount: 10 },
  { id: '6', title: 'Tính từ và Trạng từ', category: 'Từ loại', description: 'Vị trí, chức năng và cách hình thành trạng từ từ tính từ.', progress: 0, lessonsCount: 5 },
];

const mockGrammarDetail: GrammarDetailData = {
  ...mockGrammarTopics[2], // Danh từ...
  lessons: [
    {
      id: 'L1',
      index: '01',
      title: 'Từ hạn định và cụm danh từ',
      questionCount: 10,
      isFree: true,
      content: `
        <h2 class="flex items-center gap-3 text-2xl font-bold text-[#1e293b] mb-6">
          <span class="p-2 bg-blue-50 rounded-lg text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg></span>
          TỪ HẠN ĐỊNH & CỤM DANH TỪ TRONG TOEIC
        </h2>
        
        <div class="space-y-6 text-[#334155] leading-relaxed">
          <h3 class="flex items-center gap-3 text-xl font-bold text-[#1e293b]">
            <span class="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </span>
            1. Từ hạn định (Determiners) là gì?
          </h3>
          
          <p>
            <strong>Từ hạn định</strong> là những từ đứng <strong>trước danh từ</strong> để giúp xác định danh từ đó rõ hơn về:
          </p>
          
          <ul class="list-disc pl-8 space-y-2">
            <li>Số lượng</li>
            <li>Sở hữu</li>
            <li>Phạm vi</li>
            <li>Mức độ xác định</li>
          </ul>
          
          <div class="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-400">
            <p class="text-orange-800 font-medium italic flex items-center gap-2">
              👉 Trong TOEIC Part 5, đây là nhóm ngữ pháp xuất hiện <strong>rất thường xuyên</strong>.
            </p>
          </div>
        </div>
      `
    },
    { id: 'L2', index: '02', title: 'Cách chọn danh từ dựa vào vị trí trong câu', questionCount: 10, isFree: true, content: 'Nội dung đang cập nhật...' },
    { id: 'L3', index: '03', title: 'Hai danh từ đứng cạnh nhau', questionCount: 5, isFree: true, content: 'Nội dung đang cập nhật...' },
    { id: 'L4', index: '04', title: 'Danh từ số ít không đứng một mình', questionCount: 4, isFree: true, content: 'Nội dung đang cập nhật...' },
    { id: 'L5', index: '05', title: 'Danh từ có đuôi -al và -ive', questionCount: 3, isFree: false, content: 'Nội dung dành cho tài khoản PRO.' },
  ]
};

export const grammarService = {
  getTopics: async (): Promise<GrammarTopic[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockGrammarTopics;
  },
  
  getTopicDetail: async (id: string): Promise<GrammarDetailData> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...mockGrammarDetail, id };
  }
};
