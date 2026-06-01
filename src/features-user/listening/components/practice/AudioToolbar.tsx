import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Flag, Pause, Play, RotateCcw } from 'lucide-react';

interface AudioToolbarProps {
  current: number;
  total: number;
  audioUrl: string;
  startMs?: number | null;
  endMs?: number | null;
  onPrev: () => void;
  onNext: () => void;
}

export const AudioToolbar = ({ current, total, audioUrl, startMs, endMs, onPrev, onNext }: AudioToolbarProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const startSeconds = typeof startMs === 'number' ? startMs / 1000 : 0;
  const endSeconds = typeof endMs === 'number' ? endMs / 1000 : null;

  const playFromStart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startSeconds;
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [startSeconds]);

  useEffect(() => {
    setIsPlaying(false);
    if (!audioRef.current || !audioUrl) return;
    audioRef.current.pause();
    audioRef.current.currentTime = startSeconds;
    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [audioUrl, startSeconds]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Control' || event.repeat) return;
      event.preventDefault();
      playFromStart();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playFromStart]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (audio.currentTime < startSeconds || (endSeconds !== null && audio.currentTime >= endSeconds)) {
      audio.currentTime = startSeconds;
    }
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (endSeconds !== null && audio.currentTime >= endSeconds) {
      audio.pause();
      audio.currentTime = endSeconds;
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-[#111827]">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) audioRef.current.currentTime = startSeconds;
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <div className="flex items-center gap-3">
        <button onClick={onPrev} className="text-[#98a2b3] transition hover:text-[#004ac6]" aria-label="Câu trước">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={togglePlayback} className="transition hover:text-[#004ac6]" aria-label={isPlaying ? 'Tạm dừng' : 'Phát câu hiện tại'}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={onNext} className="transition hover:text-[#004ac6]" aria-label="Câu tiếp theo">
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-[#667085]">{current} / {total}</span>
        
        <button onClick={playFromStart} className="transition hover:text-[#004ac6]" aria-label="Phát lại">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-[#111827]">
        <Flag className="h-4 w-4" />
        <FileText className="h-4 w-4" />
      </div>
    </div>
  );
};
