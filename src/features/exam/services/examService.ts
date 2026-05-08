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

const mockExamDetail: ExamDetail = {
  id: '1',
  title: 'ETS 2024 Test 1',
  parts: [
    {
      id: 1,
      name: 'Part 1',
      instruction: 'Select the one statement that best describes what you see in the picture.',
      questions: [
        {
          id: 1,
          type: 'picture',
          image: 'https://images.unsplash.com/photo-1600880212319-78443973dd11?q=80&w=2070&auto=format&fit=crop',
          options: ['(A)', '(B)', '(C)', '(D)'],
        },
        {
          id: 2,
          type: 'picture',
          image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop',
          options: ['(A)', '(B)', '(C)', '(D)'],
        }
      ]
    },
    {
      id: 2,
      name: 'Part 2',
      instruction: 'Select the best response to the question.',
      questions: [
        { id: 7, type: 'audio_only', options: ['(A)', '(B)', '(C)'] },
        { id: 8, type: 'audio_only', options: ['(A)', '(B)', '(C)'] },
        { id: 9, type: 'audio_only', options: ['(A)', '(B)', '(C)'] }
      ]
    },
    {
      id: 3,
      name: 'Part 3',
      instruction: 'Listen to a conversation and answer the questions.',
      questions: [
        {
          id: 32,
          type: 'audio_group',
          subQuestions: [
            { id: 32, text: 'Where most likely are the speakers?', options: ['(A) In a bank', '(B) In a restaurant', '(C) In a hotel', '(D) In a retail store'] },
            { id: 33, text: 'What does the woman want to do?', options: ['(A) Open an account', '(B) Book a room', '(C) Return an item', '(D) Order some food'] },
            { id: 34, text: 'What will the man do next?', options: ['(A) Check a computer', '(B) Call a manager', '(C) Provide a discount', '(D) Give a refund'] }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Part 4',
      instruction: 'Listen to a short talk and answer the questions.',
      questions: [
        {
          id: 71,
          type: 'audio_group',
          subQuestions: [
            { id: 71, text: 'Who is the speaker most likely?', options: ['(A) A tour guide', '(B) A pilot', '(C) A flight attendant', '(D) A hotel manager'] },
            { id: 72, text: 'What is the purpose of the talk?', options: ['(A) To give safety instructions', '(B) To announce a delay', '(C) To describe a tourist site', '(D) To welcome new employees'] },
            { id: 73, text: 'According to the speaker, what will happen at 2:00 P.M.?', options: ['(A) The plane will land', '(B) The bus will depart', '(C) The meeting will start', '(D) The museum will open'] }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Part 5',
      instruction: 'Select the best word or phrase to complete the sentence.',
      questions: [
        {
          id: 101,
          type: 'text_only',
          text: 'The new software update is expected to improve the system\'s _______ significantly.',
          options: ['(A) perform', '(B) performance', '(C) performed', '(D) performing']
        },
        {
          id: 102,
          type: 'text_only',
          text: 'Ms. Sato was _______ to hear that the project had been approved ahead of schedule.',
          options: ['(A) delight', '(B) delightful', '(C) delighted', '(D) delighting']
        }
      ]
    },
    {
      id: 6,
      name: 'Part 6',
      instruction: 'Read the text and select the best word or phrase for each blank.',
      questions: [
        {
          id: 131,
          type: 'passage_group',
          content: {
            stimuli: [
              {
                type: 'text',
                title: 'Internal Memorandum',
                content: 'To: All Staff\nFrom: Facilities Management\nSubject: Elevator Maintenance\n\nStarting tomorrow, the main elevators will be out of service for regular maintenance. This work is scheduled to last for three days. [131] during this period, please use the service elevators located at the back of the building. We understand that this may cause some _______ [132] and thank you for your patience. Our goal is to ensure the _______ [133] of all building systems.'
              }
            ]
          },
          subQuestions: [
            { id: 131, text: 'Question 131', options: ['(A) However', '(B) Furthermore', '(C) Therefore', '(D) Instead'] },
            { id: 132, text: 'Question 132', options: ['(A) inconvenient', '(B) inconvenience', '(C) inconvenienced', '(D) inconveniently'] },
            { id: 133, text: 'Question 133', options: ['(A) reliable', '(B) reliability', '(C) reliably', '(D) relied'] }
          ]
        }
      ]
    },
    {
      id: 7,
      name: 'Part 7',
      instruction: 'Select the best response to each question.',
      questions: [
        {
          id: 147,
          type: 'passage_group',
          content: {
            stimuli: [
              {
                type: 'text',
                title: 'Advertisement',
                content: 'Looking for a new challenge? Green Valley Tech is seeking a Senior Developer to lead our mobile app team. Candidates should have at least 5 years of experience and a passion for innovation. Apply online today at www.gvtech.com/careers.'
              }
            ]
          },
          subQuestions: [
            { id: 147, text: 'What is being advertised?', options: ['(A) A new mobile app', '(B) A job opening', '(C) A tech conference', '(D) A software update'] },
            { id: 148, text: 'How can candidates apply?', options: ['(A) By calling the office', '(B) By visiting a website', '(C) By sending a resume via mail', '(D) By attending an open house'] }
          ]
        },
        {
          id: 176,
          type: 'passage_group',
          content: {
            stimuli: [
              {
                type: 'text',
                title: 'Notice',
                content: 'Dear Customers,\n\nWe are excited to announce our upcoming seasonal sale! Starting next Monday, all items in the store will be discounted by 20%. Please note that this offer cannot be combined with other coupons.\n\nManagement'
              },
              {
                type: 'image',
                title: 'Market Share Chart',
                url: 'https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?q=80&w=2070&auto=format&fit=crop'
              },
              {
                type: 'text',
                title: 'Email',
                content: 'From: Sarah Jenkins\nTo: Customer Service\nDate: Tuesday\n\nI saw the notice about the sale. I am interested in buying a new laptop. Does the 20% discount apply to electronics as well? Also, the chart you shared shows your market share growing. Congratulations!'
              }
            ]
          },
          subQuestions: [
            { id: 176, text: 'What is the purpose of the notice?', options: ['(A) To announce a new store opening', '(B) To inform customers about a sale', '(C) To recruit new staff', '(D) To apologize for a service delay'] },
            { id: 177, text: 'When did Sarah Jenkins write the email?', options: ['(A) Monday', '(B) Tuesday', '(C) Wednesday', '(D) Friday'] },
            { id: 178, text: 'According to the stimuli, what is true about the sale?', options: ['(A) It applies to all items', '(B) It starts on Tuesday', '(C) It can be used with other coupons', '(D) It lasts for one month'] }
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
