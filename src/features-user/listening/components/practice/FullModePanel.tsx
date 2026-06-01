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
  <div className="max-w-[1000px] space-y-3">
    <section className="rounded-xl border border-[#dbe3ef] bg-white p-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-3">
        <button onClick={onPrev} className="rounded-lg border border-[#dbe3ef] p-2.5 text-[#94a3b8]">
          <SkipBack className="h-4 w-4" />
        </button>
        <button className="rounded-full bg-[#0ea5e9] p-4 text-white ring-4 ring-cyan-100">
          <Play className="h-5 w-5" />
        </button>
        <button onClick={onNext} className="rounded-lg border border-[#dbe3ef] p-2.5 text-[#0f172a]">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm text-[#526985]">Câu {current} / {total} •</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-bold">
        <button className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4" />Từ đầu</button>
        <span>Tự động phát: Tắt</span>
        <button onClick={onToggleVisible} className="flex items-center gap-1.5"><VolumeX className="h-4 w-4" />{visible ? 'Ẩn script' : 'Hiện script'}</button>
        <span>1x</span>
      </div>
    </section>

    <section className="rounded-xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
      <p className="mb-2.5 text-xs font-black uppercase tracking-wide text-[#526985]">Transcript</p>
      <p className={`text-[15px] leading-6 ${visible ? '' : 'select-none blur-sm'}`}>{text}</p>
      <p className="mb-2 mt-5 text-xs font-black uppercase tracking-wide text-[#526985]">Dịch nghĩa</p>
      <p className={`text-sm italic leading-5 text-[#526985] ${visible ? '' : 'select-none blur-sm'}`}>{translation}</p>
    </section>

    <section className="rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
      <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#526985]">Danh sách câu</p>
      <div className="flex gap-2">
        {sentences.map((sentence, index) => (
          <button
            key={sentence.id}
            onClick={() => onSelect(sentence.id)}
            className={`h-8 w-8 rounded-lg text-sm font-bold ${
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
