import type { Exam, ExamDetail } from '../types';

const mockExams: Exam[] = [
  { id: '1', tab: 'ETS 2024', title: 'ETS 2024 Test 1', status: 'Đề mới', progress: 2, doneQuestions: 4, totalQuestions: 200, learnersCount: '12.4k', isNew: true },
  { id: '2', tab: 'ETS 2024', title: 'ETS 2024 Test 2', status: 'Chưa luyện tập', progress: 0, doneQuestions: 0, totalQuestions: 200, learnersCount: '8.1k' },
  { id: '3', tab: 'ETS 2024', title: 'ETS 2024 Test 3', status: 'Chưa luyện tập', progress: 0, doneQuestions: 0, totalQuestions: 200, learnersCount: '6.5k' },
  { id: '4', tab: 'ETS 2024', title: 'ETS 2023 Test 1', status: 'Đang làm', progress: 42, doneQuestions: 84, totalQuestions: 200, learnersCount: '9.8k' },
  { id: '5', tab: 'ETS 2022', title: 'ETS 2022 Test 1', status: 'Đã hoàn thành', progress: 100, doneQuestions: 200, totalQuestions: 200, learnersCount: '11.2k' },
  { id: '6', tab: 'Economy TOEIC', title: 'Economy TOEIC Test 1', status: 'Đang làm', progress: 56, doneQuestions: 112, totalQuestions: 200, learnersCount: '6.9k' },
  { id: '7', tab: 'New Economy', title: 'New Economy Test 1', status: 'Chưa luyện tập', progress: 0, doneQuestions: 0, totalQuestions: 200, learnersCount: '3.3k' },
  { id: '8', tab: 'Hacker TOEIC', title: 'Hacker TOEIC Test 1', status: 'Chưa luyện tập', progress: 0, doneQuestions: 0, totalQuestions: 200, learnersCount: '4.1k' },
];

export const mockExamDetail: ExamDetail = {
  id: '1',
  title: 'ETS 2024 Test 1 - Realistic Short Mock',
  parts: [
    {
      id: 1,
      name: 'Part 1',
      instruction: 'Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture.',
      questions: [
        {
          id: 1,
          type: 'picture',
          image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop',
          options: ['(A)', '(B)', '(C)', '(D)'],
          correctAnswer: '(C)',
          explanation: 'Bức ảnh chụp một người phụ nữ đang làm việc trên máy tính xách tay. Giả định Audio: (A) Cô ấy đang rót một tách cà phê. (B) Cô ấy đang cởi áo khoác. (C) Cô ấy đang gõ phím trên máy tính. (D) Cô ấy đang điều chỉnh màn hình. -> Đáp án (C) mô tả chính xác nhất hành động đang diễn ra trong hình.',
        }
      ]
    },
    {
      id: 2,
      name: 'Part 2',
      instruction: 'Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement.',
      questions: [
        { 
          id: 7, 
          type: 'audio_only', 
          options: ['(A)', '(B)', '(C)'], 
          correctAnswer: '(B)', 
          explanation: 'Giả định Audio câu hỏi: "Where is the new printer located?" (Máy in mới được đặt ở đâu?). Giả định Audio trả lời: (A) Khoảng 50 đô la. (B) Trong phòng nghỉ của nhân viên. (C) Không, nó chưa được in. -> Câu hỏi bắt đầu bằng từ để hỏi "Where" (Ở đâu). Đáp án (B) chỉ định một địa điểm nên là phản hồi tự nhiên và chính xác nhất.' 
        }
      ]
    },
    {
      id: 3,
      name: 'Part 3',
      instruction: 'Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation.',
      questions: [
        {
          id: 32,
          type: 'audio_group',
          subQuestions: [
            { 
              id: 32, 
              text: 'Why is the woman calling?', 
              options: ['(A) To cancel a flight', '(B) To make a hotel reservation', '(C) To inquire about a job', '(D) To request a refund'], 
              correctAnswer: '(B) To make a hotel reservation', 
              explanation: 'Dựa vào ngữ cảnh đoạn hội thoại (người phụ nữ hỏi về phòng trống cho ngày cuối tuần và các tiện ích đi kèm), mục đích chính của cuộc gọi là để đặt phòng khách sạn.' 
            },
            { 
              id: 33, 
              text: 'What does the man offer to send?', 
              options: ['(A) A confirmation email', '(B) A discount code', '(C) A travel brochure', '(D) A map of the city'], 
              correctAnswer: '(A) A confirmation email', 
              explanation: 'Ở cuối đoạn hội thoại, người đàn ông nói: "I will send a confirmation email right away." (Tôi sẽ gửi email xác nhận ngay lập tức). Do đó, đáp án (A) là chính xác.' 
            }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Part 4',
      instruction: 'Directions: You will hear some talks given by a single speaker. You will be asked to answer three questions about what the speaker says in each talk.',
      questions: [
        {
          id: 71,
          type: 'audio_group',
          subQuestions: [
            { 
              id: 71, 
              text: 'Where is the announcement being made?', 
              options: ['(A) At an airport', '(B) At a train station', '(C) In a movie theater', '(D) In a shopping mall'], 
              correctAnswer: '(A) At an airport', 
              explanation: 'Bài thông báo sử dụng các từ vựng đặc trưng như "flight 804" (chuyến bay 804), "boarding gate" (cổng lên máy bay), "passengers" (hành khách). Điều này chứng tỏ thông báo được phát tại một sân bay.' 
            }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Part 5',
      instruction: 'Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence.',
      questions: [
        {
          id: 101,
          type: 'text_only',
          text: 'The management team requested that all monthly expense reports be submitted _______ by 5:00 P.M. on Friday.',
          options: ['(A) prompt', '(B) prompts', '(C) promptly', '(D) promptness'],
          correctAnswer: '(C) promptly',
          explanation: 'Chỗ trống đứng sau động từ "submitted" nên cần một trạng từ để bổ nghĩa cho động từ đó. "Promptly" (một cách nhanh chóng, đúng giờ) là trạng từ duy nhất trong các đáp án. (A) là tính từ/động từ, (B) là động từ chia ngôi thứ 3 số ít, (D) là danh từ.'
        },
        {
          id: 102,
          type: 'text_only',
          text: 'Due to the heavy snowstorm, the keynote speaker will arrive _______ later than originally scheduled.',
          options: ['(A) slightly', '(B) closely', '(C) exactly', '(D) tightly'],
          correctAnswer: '(A) slightly',
          explanation: 'Đây là câu hỏi về từ vựng. "Slightly" mang nghĩa là "một chút", đi với "later" tạo thành cụm "slightly later" (trễ hơn một chút). Các đáp án khác không phù hợp về mặt ngữ nghĩa trong ngữ cảnh này.'
        }
      ]
    },
    {
      id: 6,
      name: 'Part 6',
      instruction: 'Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text.',
      questions: [
        {
          id: 131,
          type: 'passage_group',
          content: {
            stimuli: [
              {
                type: 'text',
                title: 'Email',
                content: 'To: All Employees\nFrom: IT Department\nSubject: Network Maintenance\n\nPlease be advised that the company network will undergo routine maintenance this weekend. The system will be taken offline starting at 10:00 P.M. on Saturday and will remain unavailable _______ [131] 6:00 A.M. on Sunday. Please save all your work before the downtime. We apologize for any _______ [132] this may cause.'
              }
            ]
          },
          subQuestions: [
            { 
              id: 131, 
              text: 'Question 131', 
              options: ['(A) until', '(B) since', '(C) during', '(D) over'], 
              correctAnswer: '(A) until', 
              explanation: 'Cấu trúc "remain + adj + until + thời điểm" (duy trì tình trạng... cho đến khi). Hệ thống sẽ không khả dụng CHO ĐẾN (until) 6 giờ sáng Chủ Nhật.' 
            },
            { 
              id: 132, 
              text: 'Question 132', 
              options: ['(A) convenience', '(B) inconvenient', '(C) inconvenience', '(D) inconvenienced'], 
              correctAnswer: '(C) inconvenience', 
              explanation: 'Sau lượng từ "any" cần một danh từ. Cụm từ cố định thường gặp trong thư tín thương mại: "apologize for any inconvenience" (xin lỗi vì bất kỳ sự bất tiện nào).' 
            }
          ]
        }
      ]
    },
    {
      id: 7,
      name: 'Part 7',
      instruction: 'Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, e-mails, and instant messages. Each text or set of texts is followed by several questions. Select the best answer for each question.',
      questions: [
        {
          id: 147,
          type: 'passage_group',
          content: {
            stimuli: [
              {
                type: 'text',
                title: 'Memorandum',
                content: 'To: Sales Team\nFrom: Marcus Reed, Director of Sales\nDate: October 12\nSubject: Quarterly Meeting\n\nOur next quarterly sales meeting will take place on October 20 at 9:00 A.M. in the main conference room. We will be discussing the Q3 financial results and introducing the new product line launching in November. Breakfast will be catered by Sunrise Cafe. Please review the attached agenda beforehand.'
              }
            ]
          },
          subQuestions: [
            { 
              id: 147, 
              text: 'What is the main topic of the meeting?', 
              options: ['(A) Organizing a company retreat', '(B) Reviewing financial results and new products', '(C) Hiring new sales representatives', '(D) Upgrading the office software'], 
              correctAnswer: '(B) Reviewing financial results and new products', 
              explanation: 'Trong đoạn văn có đề cập rõ ràng mục đích của cuộc họp: "We will be discussing the Q3 financial results and introducing the new product line" (Chúng ta sẽ thảo luận về kết quả tài chính quý 3 và giới thiệu dòng sản phẩm mới). Do đó chọn (B).' 
            },
            { 
              id: 148, 
              text: 'What are attendees asked to do before the meeting?', 
              options: ['(A) Submit an expense report', '(B) Contact Sunrise Cafe', '(C) Read an agenda', '(D) Prepare a presentation'], 
              correctAnswer: '(C) Read an agenda', 
              explanation: 'Câu cuối cùng của đoạn ghi chú viết: "Please review the attached agenda beforehand." (Vui lòng xem trước chương trình làm việc được đính kèm). "Review" đồng nghĩa với "Read".' 
            }
          ]
        }
      ]
    }
  ]
};

export const examService = {
  getExams: async (): Promise<Exam[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockExams;
  },
  
  getExamDetail: async (id: string): Promise<ExamDetail> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // In a real app, you'd fetch by ID. Here we just return the mock detail.
    return { ...mockExamDetail, id };
  }
};
