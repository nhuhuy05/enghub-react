import type { ListeningExerciseGroup, ListeningSession, ListeningTest } from '../types';

const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

interface SentenceTemplate {
  text: string;
  translation: string;
}

type SentenceTemplateGroup = SentenceTemplate[];

const fullToeicParts = [
  {
    id: 'part-1',
    name: 'Part 1',
    title: 'Photographs',
    description: 'Mô tả hình ảnh và chọn câu phù hợp nhất.',
    questionsCount: 6,
    duration: 480,
    progress: 17,
    status: 'in_progress' as const,
    accent: 'US',
  },
  {
    id: 'part-2',
    name: 'Part 2',
    title: 'Question-Response',
    description: 'Nghe câu hỏi ngắn và chọn câu trả lời tự nhiên.',
    questionsCount: 25,
    duration: 780,
    progress: 0,
    status: 'not_started' as const,
    accent: 'US/UK',
  },
  {
    id: 'part-3',
    name: 'Part 3',
    title: 'Conversations',
    description: 'Luyện hội thoại công việc, dịch vụ và lịch hẹn.',
    questionsCount: 39,
    duration: 1200,
    progress: 0,
    status: 'not_started' as const,
    accent: 'US/AU',
  },
  {
    id: 'part-4',
    name: 'Part 4',
    title: 'Short Talks',
    description: 'Nghe thông báo, voicemail và bài nói ngắn.',
    questionsCount: 30,
    duration: 1080,
    progress: 0,
    status: 'not_started' as const,
    accent: 'UK/AU',
  },
];

const listeningTests: ListeningTest[] = [
  {
    id: 'ets-2026-test-1',
    collection: 'ETS 2026',
    name: 'Test 1',
    title: 'TEST 1 2026',
    description: 'Bộ đề luyện nghe TOEIC theo cấu trúc Part 1 đến Part 4.',
    progress: 6,
    totalQuestions: 100,
    estimatedMinutes: 45,
    isNew: true,
    parts: fullToeicParts,
  },
  {
    id: 'ets-2026-test-2',
    collection: 'ETS 2026',
    name: 'Test 2',
    title: 'TEST 2 2026',
    description: 'Tập trung tốc độ đọc nhanh và từ vựng công sở.',
    progress: 0,
    totalQuestions: 100,
    estimatedMinutes: 45,
    parts: fullToeicParts.map((part) => ({
      ...part,
      progress: 0,
      status: 'not_started',
    })),
  },
  {
    id: 'toeic-master-test-1',
    collection: 'TOEIC MASTER',
    name: 'Business Pack',
    title: 'TOEIC Master Business Listening',
    description: 'Luyện nghe các tình huống phòng họp, email và dự án.',
    progress: 50,
    totalQuestions: 100,
    estimatedMinutes: 38,
    parts: fullToeicParts.map((part) => ({
      ...part,
      title: part.id === 'part-1' ? 'Business Photographs' : part.title,
      progress: part.id === 'part-1' ? 50 : part.id === 'part-2' ? 25 : 0,
      status: part.id === 'part-1' || part.id === 'part-2' ? 'in_progress' : 'not_started',
      accent: part.id === 'part-2' ? 'US' : part.accent,
    })),
  },
];

const sentenceTemplatesByPart: Record<string, SentenceTemplateGroup[]> = {
  'part-1': [
    [
      {
        text: 'The woman is carrying a tray of food.',
        translation: 'Người phụ nữ đang bưng một khay thức ăn.',
      },
      {
        text: 'The woman is setting a table.',
        translation: 'Người phụ nữ đang dọn bàn.',
      },
      {
        text: 'The woman is opening a refrigerator.',
        translation: 'Người phụ nữ đang mở tủ lạnh.',
      },
      {
        text: 'The woman is washing some dishes.',
        translation: 'Người phụ nữ đang rửa bát đĩa.',
      },
    ],
    [
      {
        text: 'A man is reading a document at his desk.',
        translation: 'Một người đàn ông đang đọc tài liệu tại bàn làm việc.',
      },
      {
        text: 'A man is repairing a computer.',
        translation: 'Một người đàn ông đang sửa máy tính.',
      },
      {
        text: 'A man is standing beside a printer.',
        translation: 'Một người đàn ông đang đứng cạnh máy in.',
      },
      {
        text: 'A man is putting papers into a folder.',
        translation: 'Một người đàn ông đang cho giấy tờ vào bìa hồ sơ.',
      },
    ],
    [
      {
        text: 'Several people are waiting near the entrance.',
        translation: 'Một vài người đang chờ gần lối vào.',
      },
      {
        text: 'Several people are crossing the street.',
        translation: 'Một vài người đang băng qua đường.',
      },
      {
        text: 'Several people are seated around a table.',
        translation: 'Một vài người đang ngồi quanh một chiếc bàn.',
      },
      {
        text: 'Several people are looking at a display.',
        translation: 'Một vài người đang nhìn vào một màn hình trưng bày.',
      },
    ],
    [
      {
        text: 'The shelves have been arranged neatly.',
        translation: 'Các kệ đã được sắp xếp gọn gàng.',
      },
      {
        text: 'The shelves are being painted.',
        translation: 'Các kệ đang được sơn.',
      },
      {
        text: 'The shelves are empty.',
        translation: 'Các kệ đang trống.',
      },
      {
        text: 'The shelves have been moved outside.',
        translation: 'Các kệ đã được chuyển ra bên ngoài.',
      },
    ],
    [
      {
        text: 'A worker is placing boxes on a cart.',
        translation: 'Một nhân viên đang đặt các hộp lên xe đẩy.',
      },
      {
        text: 'A worker is cleaning a window.',
        translation: 'Một nhân viên đang lau cửa sổ.',
      },
      {
        text: 'A worker is loading bags into a car.',
        translation: 'Một nhân viên đang chất túi vào xe hơi.',
      },
      {
        text: 'A worker is speaking into a microphone.',
        translation: 'Một nhân viên đang nói vào micro.',
      },
    ],
    [
      {
        text: 'Some chairs are lined up beside the wall.',
        translation: 'Một vài chiếc ghế được xếp thành hàng cạnh bức tường.',
      },
      {
        text: 'Some chairs are stacked on a stage.',
        translation: 'Một vài chiếc ghế được xếp chồng trên sân khấu.',
      },
      {
        text: 'Some chairs are being carried upstairs.',
        translation: 'Một vài chiếc ghế đang được mang lên cầu thang.',
      },
      {
        text: 'Some chairs are placed around a conference table.',
        translation: 'Một vài chiếc ghế được đặt quanh bàn họp.',
      },
    ],
  ],
  'part-2': [
    [
      {
        text: 'Could you send me the updated schedule?',
        translation: 'Bạn có thể gửi cho tôi lịch trình đã cập nhật không?',
      },
      {
        text: 'Sure, I will email it this afternoon.',
        translation: 'Được, tôi sẽ gửi email chiều nay.',
      },
      {
        text: 'The schedule is posted near the elevator.',
        translation: 'Lịch trình được dán gần thang máy.',
      },
    ],
    [
      {
        text: 'When does the meeting start tomorrow?',
        translation: 'Cuộc họp ngày mai bắt đầu lúc nào?',
      },
      {
        text: 'It starts at nine in conference room B.',
        translation: 'Nó bắt đầu lúc chín giờ ở phòng họp B.',
      },
      {
        text: 'The manager already sent the agenda.',
        translation: 'Quản lý đã gửi chương trình họp rồi.',
      },
    ],
    [
      {
        text: 'Where did you leave the quarterly report?',
        translation: 'Bạn đã để báo cáo quý ở đâu?',
      },
      {
        text: 'I left it on your desk.',
        translation: 'Tôi đã để nó trên bàn của bạn.',
      },
      {
        text: 'The printer is out of paper again.',
        translation: 'Máy in lại hết giấy rồi.',
      },
    ],
    [
      {
        text: 'Why did the client cancel the appointment?',
        translation: 'Tại sao khách hàng hủy cuộc hẹn?',
      },
      {
        text: 'Their flight was delayed by two hours.',
        translation: 'Chuyến bay của họ bị hoãn hai tiếng.',
      },
      {
        text: 'We can meet in the lobby instead.',
        translation: 'Thay vào đó chúng ta có thể gặp ở sảnh.',
      },
    ],
  ],
  'part-3': [
    [
      {
        text: 'Hi, I need to change the reservation for tonight.',
        translation: 'Xin chào, tôi cần đổi đặt chỗ cho tối nay.',
      },
      {
        text: 'Certainly, what time would you like to come in?',
        translation: 'Chắc chắn rồi, bạn muốn đến lúc mấy giờ?',
      },
      {
        text: 'Could you move it from seven to eight thirty?',
        translation: 'Bạn có thể chuyển từ bảy giờ sang tám giờ ba mươi không?',
      },
    ],
    [
      {
        text: 'The projector in conference room B is not working.',
        translation: 'Máy chiếu trong phòng họp B không hoạt động.',
      },
      {
        text: 'I will ask the technician to check it before lunch.',
        translation: 'Tôi sẽ nhờ kỹ thuật viên kiểm tra trước bữa trưa.',
      },
      {
        text: 'Thanks, the client presentation starts at one.',
        translation: 'Cảm ơn, buổi thuyết trình với khách hàng bắt đầu lúc một giờ.',
      },
    ],
    [
      {
        text: 'Did the shipment from Singapore arrive this morning?',
        translation: 'Lô hàng từ Singapore đã đến sáng nay chưa?',
      },
      {
        text: 'Not yet, but the driver called from the warehouse.',
        translation: 'Chưa, nhưng tài xế đã gọi từ kho hàng.',
      },
      {
        text: 'Please let me know when the boxes are unloaded.',
        translation: 'Vui lòng báo cho tôi khi các thùng hàng được dỡ xuống.',
      },
    ],
  ],
  'part-4': [
    [
      {
        text: 'Good morning, this is an announcement for all passengers.',
        translation: 'Chào buổi sáng, đây là thông báo dành cho tất cả hành khách.',
      },
      {
        text: 'Flight 218 to Boston has been delayed by forty minutes.',
        translation: 'Chuyến bay 218 đến Boston đã bị hoãn bốn mươi phút.',
      },
      {
        text: 'Please remain near gate twelve for further updates.',
        translation: 'Vui lòng ở gần cổng số mười hai để nhận cập nhật tiếp theo.',
      },
    ],
    [
      {
        text: 'Thank you for calling Green Valley Medical Center.',
        translation: 'Cảm ơn bạn đã gọi đến Trung tâm Y tế Green Valley.',
      },
      {
        text: 'Our office hours have changed for the holiday weekend.',
        translation: 'Giờ làm việc của chúng tôi đã thay đổi cho cuối tuần lễ.',
      },
      {
        text: 'To make an appointment, please press one now.',
        translation: 'Để đặt lịch hẹn, vui lòng nhấn phím một ngay bây giờ.',
      },
    ],
    [
      {
        text: "Welcome to today's staff training session.",
        translation: 'Chào mừng đến với buổi đào tạo nhân viên hôm nay.',
      },
      {
        text: 'We will begin with a review of safety procedures.',
        translation: 'Chúng ta sẽ bắt đầu bằng việc ôn lại các quy trình an toàn.',
      },
      {
        text: 'Please sign the attendance sheet before you leave.',
        translation: 'Vui lòng ký vào bảng điểm danh trước khi rời đi.',
      },
    ],
  ],
};

const partGroupCounts = {
  'part-1': 6,
  'part-2': 25,
  'part-3': 13,
  'part-4': 10,
};

const vocabularyByPart = {
  'part-1': [
    { term: 'tray', meaning: 'khay' },
    { term: 'document', meaning: 'tài liệu' },
    { term: 'entrance', meaning: 'lối vào' },
  ],
  'part-2': [
    { term: 'schedule', meaning: 'lịch trình' },
    { term: 'appointment', meaning: 'cuộc hẹn' },
    { term: 'updated', meaning: 'đã cập nhật' },
  ],
  'part-3': [
    { term: 'reserve', meaning: 'đặt trước' },
    { term: 'supplier', meaning: 'nhà cung cấp' },
    { term: 'budget', meaning: 'ngân sách' },
  ],
  'part-4': [
    { term: 'passenger', meaning: 'hành khách' },
    { term: 'maintenance', meaning: 'bảo trì' },
    { term: 'training session', meaning: 'buổi đào tạo' },
  ],
};

const buildGroups = (partId: string): ListeningExerciseGroup[] => {
  const templates = sentenceTemplatesByPart[partId] || sentenceTemplatesByPart['part-1'];
  const groupCount = partGroupCounts[partId as keyof typeof partGroupCounts] || 6;

  return Array.from({ length: groupCount }, (_, groupIndex) => {
    const sentences = templates[groupIndex % templates.length];

    return {
      id: `group-${groupIndex + 1}`,
      title: partId === 'part-1' || partId === 'part-2' ? `Câu ${groupIndex + 1}` : `Bài ${groupIndex + 1}`,
      sentences: sentences.map((sentence, sentenceIndex) => ({
        id: `g${groupIndex + 1}-s${sentenceIndex + 1}`,
        text: sentence.text,
        translation: sentence.translation,
        audioUrl,
        completed: groupIndex === 0 && sentenceIndex === 0,
        hintLevels: [30, 50, 100],
      })),
    };
  });
};

const buildSession = (testId: string, partId: string): ListeningSession => {
  const test = listeningTests.find((item) => item.id === testId) || listeningTests[0];
  const part = test.parts.find((item) => item.id === partId) || test.parts[0];
  const vocabulary = vocabularyByPart[part.id as keyof typeof vocabularyByPart] || vocabularyByPart['part-1'];

  return {
    testId: test.id,
    partId: part.id,
    title: test.title,
    partName: part.name,
    instruction: `${part.title}: listen to each sentence and practice with check, dictation, or full transcript mode.`,
    audioUrl,
    duration: part.duration,
    vocabulary,
    groups: buildGroups(part.id),
  };
};

export const listeningService = {
  getTests: async (): Promise<ListeningTest[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return listeningTests;
  },

  getSession: async (testId: string, partId: string): Promise<ListeningSession> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return buildSession(testId, partId);
  },
};
