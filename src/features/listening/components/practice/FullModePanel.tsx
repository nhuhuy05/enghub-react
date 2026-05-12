import { Play, RotateCcw, SkipBack, SkipForward, VolumeX } from 'lucide-react';

interface FullModePanelProps {
  text: string;
  translation: string;
  current: number;
  total: number;
  visible: boolean;
  onToggleVisible: () => void;
  onPrev: () => void;
  onNext: () => void;
  sentences: Array<{ id: string }>;
  activeSentenceId: string;
  onSelect: (sentenceId: string) => void;
}

export const FullModePanel = ({
  text,
  translation,
  current,
  total,
  visible,
  onToggleVisible,
  onPrev,
  onNext,
  sentences,
  activeSentenceId,
  onSelect,
}: FullModePanelProps) => (
  <div className="max-w-[1000px] space-y-5">
    <section className="rounded-2xl border border-[#dbe3ef] bg-white p-8 text-center shadow-sm">
      <div className="flex items-center justify-center gap-4">
        <button onClick={onPrev} className="rounded-xl border border-[#dbe3ef] p-3 text-[#94a3b8]">
          <SkipBack className="h-5 w-5" />
        </button>
        <button className="rounded-full bg-[#0ea5e9] p-5 text-white ring-4 ring-cyan-100">
          <Play className="h-6 w-6" />
        </button>
        <button onClick={onNext} className="rounded-xl border border-[#dbe3ef] p-3 text-[#0f172a]">
          <SkipForward className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-4 text-base text-[#526985]">Câu {current} / {total} •</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-7 text-sm font-bold">
        <button className="flex items-center gap-2"><RotateCcw className="h-5 w-5" />Từ đầu</button>
        <span>Tự động phát: Tắt</span>
        <button onClick={onToggleVisible} className="flex items-center gap-2"><VolumeX className="h-5 w-5" />{visible ? 'Ẩn script' : 'Hiện script'}</button>
        <span>1x</span>
      </div>
    </section>

    <section className="rounded-2xl border border-[#dbe3ef] bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-black uppercase tracking-wide text-[#526985]">Transcript</p>
      <p className={`text-lg ${visible ? '' : 'select-none blur-sm'}`}>{text}</p>
      <p className="mb-3 mt-8 text-sm font-black uppercase tracking-wide text-[#526985]">Dịch nghĩa</p>
      <p className={`text-base italic text-[#526985] ${visible ? '' : 'select-none blur-sm'}`}>{translation}</p>
    </section>

    <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-black uppercase tracking-wide text-[#526985]">Danh sách câu</p>
      <div className="flex gap-2">
        {sentences.map((sentence, index) => (
          <button
            key={sentence.id}
            onClick={() => onSelect(sentence.id)}
            className={`h-10 w-10 rounded-xl font-bold ${
              sentence.id === activeSentenceId ? 'bg-[#0ea5e9] text-white' : 'bg-[#f1f5f9] text-[#526985]'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  </div>
);
