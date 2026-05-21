import { useState, useEffect, useRef } from 'react';
import {
  FileAudio,
  Play,
  Pause,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { AudioRange, MediaAsset } from '../../types/teacherTestTypes';

interface StepAudioRangesProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

interface DisplayGroup {
  part_number: number;
  group_order: number;
  label: string;
  start_ms: number;
  end_ms: number | null;
}

// Generate default TOEIC groups for Part 1-4
const generateDefaultGroups = (): DisplayGroup[] => {
  const groups: DisplayGroup[] = [];

  // Part 1: Q1 - Q6 (1 question per group)
  for (let i = 1; i <= 6; i++) {
    groups.push({ part_number: 1, group_order: i, label: `Câu ${i}`, start_ms: 0, end_ms: null });
  }

  // Part 2: Q7 - Q31 (1 question per group)
  for (let i = 7; i <= 31; i++) {
    groups.push({ part_number: 2, group_order: i, label: `Câu ${i}`, start_ms: 0, end_ms: null });
  }

  // Part 3: Q32 - Q70 (3 questions per group)
  for (let i = 32; i <= 70; i += 3) {
    groups.push({ part_number: 3, group_order: i, label: `Câu ${i} - ${i + 2}`, start_ms: 0, end_ms: null });
  }

  // Part 4: Q71 - Q100 (3 questions per group)
  for (let i = 71; i <= 100; i += 3) {
    groups.push({ part_number: 4, group_order: i, label: `Câu ${i} - ${i + 2}`, start_ms: 0, end_ms: null });
  }

  return groups;
};

// Format ms to mm:ss
const formatMs = (ms: number): string => {
  if (ms < 0) return '00:00';
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Parse mm:ss to ms
const parseTimeToMs = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return Math.round((mins * 60 + secs) * 1000);
  }
  const secs = parseFloat(timeStr) || 0;
  return Math.round(secs * 1000);
};

export const StepAudioRanges = ({
  testId,
  nextStep,
  prevStep,
}: StepAudioRangesProps) => {
  const [activePart, setActivePart] = useState<number>(1);
  const [audioAsset, setAudioAsset] = useState<MediaAsset | null>(null);
  const [ranges, setRanges] = useState<DisplayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Audio Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  // Range preview player
  const [previewingGroupId, setPreviewingGroupId] = useState<number | null>(null);
  const previewIntervalRef = useRef<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load media assets to find audio_main
        const mediaRes = await teacherTestService.getTestMedia(testId);
        if (mediaRes.code === 1000) {
          const mainAudio = mediaRes.result.find((m) => m.label === 'audio_main' && m.media_type === 'audio');
          if (mainAudio) {
            setAudioAsset(mainAudio);
          }
        }

        // Initialize default groups
        const defaultGroups = generateDefaultGroups();

        // Load existing audio ranges
        try {
          const rangesRes = await teacherTestService.getAudioRanges(testId);
          if (rangesRes.code === 1000 && rangesRes.result && rangesRes.result.length > 0) {
            // Merge existing data into default structure
            const merged = defaultGroups.map((g) => {
              const matched = rangesRes.result.find(
                (r) => r.part_number === g.part_number && r.group_order === g.group_order
              );
              return matched
                ? { ...g, start_ms: matched.start_ms, end_ms: matched.end_ms }
                : g;
            });
            setRanges(merged);
          } else {
            setRanges(defaultGroups);
          }
        } catch (err) {
          // If endpoint fails/not implemented, use defaults
          setRanges(defaultGroups);
        }
      } catch (err) {
        console.error('Không thể load thông tin audio ranges:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    return () => {
      clearInterval(previewIntervalRef.current);
    };
  }, [testId]);

  // Handle standard audio player state
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTimeSec(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDurationSec(audioRef.current.duration);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTimeSec(val);
    }
  };

  // Set current timestamp to active cell
  const setTimestampFromPlayer = (groupOrder: number, type: 'start' | 'end') => {
    if (!audioRef.current) return;
    const currentMs = Math.round(audioRef.current.currentTime * 1000);

    setRanges((prev) =>
      prev.map((g) => {
        if (g.part_number === activePart && g.group_order === groupOrder) {
          if (type === 'start') {
            return { ...g, start_ms: currentMs };
          } else {
            return { ...g, end_ms: currentMs };
          }
        }
        return g;
      })
    );
  };

  const handleManualTimeChange = (groupOrder: number, type: 'start' | 'end', valStr: string) => {
    const ms = parseTimeToMs(valStr);
    setRanges((prev) =>
      prev.map((g) => {
        if (g.part_number === activePart && g.group_order === groupOrder) {
          if (type === 'start') {
            return { ...g, start_ms: ms };
          } else {
            return { ...g, end_ms: valStr === '' ? null : ms };
          }
        }
        return g;
      })
    );
  };

  const resetGroup = (groupOrder: number) => {
    setRanges((prev) =>
      prev.map((g) => {
        if (g.part_number === activePart && g.group_order === groupOrder) {
          return { ...g, start_ms: 0, end_ms: null };
        }
        return g;
      })
    );
  };

  // Play a specific audio range
  const playRange = (group: DisplayGroup) => {
    if (!audioRef.current || !audioAsset) return;

    clearInterval(previewIntervalRef.current);
    
    // Seek to start
    audioRef.current.currentTime = group.start_ms / 1000;
    audioRef.current.play();
    setIsPlaying(true);
    setPreviewingGroupId(group.group_order);

    // Watcher to stop audio when reaching end_ms
    const endSec = group.end_ms ? group.end_ms / 1000 : durationSec;
    previewIntervalRef.current = setInterval(() => {
      if (audioRef.current && audioRef.current.currentTime >= endSec) {
        audioRef.current.pause();
        setIsPlaying(false);
        setPreviewingGroupId(null);
        clearInterval(previewIntervalRef.current);
      }
    }, 50);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      // Validation
      const invalid = ranges.find((g) => g.end_ms !== null && g.end_ms <= g.start_ms);
      if (invalid) {
        setErrorMsg(`Lỗi tại ${invalid.label}: Thời gian kết thúc phải lớn hơn thời gian bắt đầu.`);
        setSaving(false);
        return;
      }

      // Format payload (only include modified or all ranges)
      const payload = ranges.map((r) => ({
        part_number: r.part_number,
        group_order: r.group_order,
        start_ms: r.start_ms,
        end_ms: r.end_ms,
      }));

      const res = await teacherTestService.patchAudioRanges(testId, payload);
      if (res.code === 1000) {
        setSuccessMsg('Đã lưu các mốc thời gian thành công!');
      } else {
        setErrorMsg(res.message || 'Lưu thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi lưu các mốc thời gian');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    nextStep();
  };

  // Get current part groups
  const partGroups = ranges.filter((g) => g.part_number === activePart);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004ac6] mx-auto"></div>
        <p className="text-sm text-[#667085] mt-4">Đang tải câu hỏi và tệp nghe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-sm font-semibold text-[#b42318] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-[#edfcf2] border border-[#d3f5d5] rounded-xl text-sm font-semibold text-[#027a48] flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Main Audio Player Card */}
      {audioAsset ? (
        <div className="bg-white p-5 rounded-2xl border border-[#d8dced] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3f5fb] pb-3">
            <span className="text-xs font-bold text-[#344054] flex items-center gap-2">
              <Volume2 className="h-4.5 w-4.5 text-[#004ac6]" />
              Đang phát file nghe chính: <strong className="text-[#004ac6]">{audioAsset.original_filename}</strong>
            </span>
            <span className="text-xs font-semibold text-[#667085]">
              {formatMs(currentTimeSec * 1000)} / {formatMs(durationSec * 1000)}
            </span>
          </div>

          <audio
            ref={audioRef}
            src={audioAsset.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004ac6] text-white hover:bg-[#003da3] transition-all shadow-md"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <input
              type="range"
              min="0"
              max={durationSec || 100}
              step="0.1"
              value={currentTimeSec}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-[#e4e7ec] rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#fff3cd] border border-[#ffeeba] p-4 rounded-xl text-xs font-semibold text-[#856404] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#856404]" />
          Không tìm thấy file nghe chính `audio_main`. Vui lòng tải lên file nghe chính ở Bước 2 để sử dụng trình phát và khớp mốc thời gian.
        </div>
      )}

      {/* Parts Tabs Selector */}
      <div className="flex border-b border-[#d8dced] overflow-x-auto whitespace-nowrap bg-white rounded-t-xl">
        {[1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => setActivePart(p)}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
              activePart === p
                ? 'border-[#004ac6] text-[#004ac6] bg-[#eaf0ff]/20'
                : 'border-transparent text-[#505f76] hover:bg-[#f9fafb]'
            }`}
          >
            Part {p}
          </button>
        ))}
      </div>

      {/* Grid of group items in active Part */}
      <div className="bg-white p-6 border border-[#d8dced] rounded-b-xl shadow-sm">
        <h4 className="text-sm font-bold text-[#111827] mb-4">
          Phần {activePart}: Gắn mốc thời gian cho từng câu/nhóm câu
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
          {partGroups.map((g) => {
            const isRangePreview = previewingGroupId === g.group_order;
            return (
              <div
                key={g.group_order}
                className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                  isRangePreview ? 'bg-[#f0f4ff] border-[#004ac6]' : 'bg-[#f9fafb] border-[#e4e7ec]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#e4e7ec] pb-2">
                  <span className="text-xs font-bold text-[#111827]">{g.label}</span>
                  <div className="flex gap-1.5">
                    {audioAsset && (
                      <button
                        onClick={() => playRange(g)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                          isRangePreview
                            ? 'bg-[#d92d20] text-white'
                            : 'bg-[#004ac6] text-white hover:bg-[#003da3]'
                        }`}
                      >
                        {isRangePreview ? 'Đang chạy...' : 'Nghe thử đoạn'}
                      </button>
                    )}
                    <button
                      onClick={() => resetGroup(g.group_order)}
                      className="p-1 text-[#667085] hover:text-[#d92d20] hover:bg-white rounded transition-all"
                      title="Reset mốc"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Start time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#505f76] block">Bắt đầu (start)</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={formatMs(g.start_ms)}
                        onChange={(e) => handleManualTimeChange(g.group_order, 'start', e.target.value)}
                        placeholder="00:00"
                        className="w-full px-2 py-1 text-xs rounded border border-[#d8dced] bg-white text-center focus:outline-none focus:border-[#004ac6]"
                      />
                      {audioAsset && (
                        <button
                          type="button"
                          onClick={() => setTimestampFromPlayer(g.group_order, 'start')}
                          className="px-2 py-1 rounded bg-[#eaf0ff] hover:bg-[#004ac6]/10 text-[#004ac6] text-[10px] font-bold shrink-0"
                          title="Gắn mốc hiện tại"
                        >
                          Gắn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* End time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#505f76] block">Kết thúc (end)</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={g.end_ms !== null ? formatMs(g.end_ms) : ''}
                        onChange={(e) => handleManualTimeChange(g.group_order, 'end', e.target.value)}
                        placeholder="Không bắt buộc"
                        className="w-full px-2 py-1 text-xs rounded border border-[#d8dced] bg-white text-center focus:outline-none focus:border-[#004ac6]"
                      />
                      {audioAsset && (
                        <button
                          type="button"
                          onClick={() => setTimestampFromPlayer(g.group_order, 'end')}
                          className="px-2 py-1 rounded bg-[#eaf0ff] hover:bg-[#004ac6]/10 text-[#004ac6] text-[10px] font-bold shrink-0"
                          title="Gắn mốc hiện tại"
                        >
                          Gắn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-[#f3f5fb] flex items-center justify-between">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all"
            disabled={saving}
          >
            Lưu nháp mốc
          </button>
          <button
            onClick={handleSaveAndNext}
            className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#003da3] transition-all"
            disabled={saving}
          >
            Lưu & Tiếp tục
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
