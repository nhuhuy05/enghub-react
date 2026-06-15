import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions.esm.js';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Headphones,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { adminListeningService, getAdminListeningErrorMessage } from '../services/adminListeningService';
import type {
  AdminListeningCollection,
  AdminListeningGroupDetail,
  AdminListeningGroupSummary,
  AdminListeningPartNumber,
  AdminListeningTest,
  TranscriptLine,
} from '../types';

const parts: AdminListeningPartNumber[] = [1, 2, 3, 4];

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      const payload = data as {
        code?: number;
        message?: unknown;
        error?: unknown;
        details?: unknown;
        result?: unknown;
      };
      const message = [payload.message, payload.error, payload.details, payload.result]
        .find((value) => typeof value === 'string' && value.trim());
      return getAdminListeningErrorMessage(payload.code, typeof message === 'string' ? message : fallback);
    }
  }
  return err instanceof Error ? err.message || fallback : fallback;
};

const formatQuestionNumbers = (value: number[] | string | undefined) => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
};

const formatTimestamp = (ms: number | null) => {
  if (ms === null) return '--:--';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
};

const formatSecondsInput = (ms: number | null) => {
  if (ms === null) return '';
  return (ms / 1000).toFixed(2).replace(/\.?0+$/, '');
};

const parseSecondsToMs = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 1000);
};

const createEmptyLine = (orderIndex: number): TranscriptLine => ({
  speaker: null,
  text_en: '',
  text_vi: null,
  start_ms: null,
  end_ms: null,
  order_index: orderIndex,
});

const reindexLines = (lines: TranscriptLine[]) => lines.map((line, index) => ({ ...line, order_index: index }));

const validateLines = (lines: TranscriptLine[]) => {
  const orders = new Set<number>();
  const filledLines = lines.filter((line) => line.text_en.trim() || line.text_vi?.trim() || line.speaker?.trim());
  for (const line of filledLines) {
    if (!line.text_en.trim()) return 'text_en bắt buộc cho mọi line.';
    if (line.order_index < 0) return 'order_index phải lớn hơn hoặc bằng 0.';
    if (orders.has(line.order_index)) return 'order_index không được trùng.';
    orders.add(line.order_index);
    if (line.speaker && line.speaker.length > 100) return 'speaker tối đa 100 ký tự.';
    if (line.start_ms !== null && line.start_ms < 0) return 'start_ms phải lớn hơn hoặc bằng 0.';
    if (line.end_ms !== null && line.end_ms < 0) return 'end_ms phải lớn hơn hoặc bằng 0.';
    if (line.start_ms !== null && line.end_ms !== null && line.end_ms <= line.start_ms) {
      return 'end_ms phải lớn hơn start_ms.';
    }
  }
  return '';
};

interface AutoGrowingTextareaProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const AutoGrowingTextarea = ({ value, placeholder, onChange }: AutoGrowingTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(44, textarea.scrollHeight)}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={1}
      className="min-h-[44px] resize-none overflow-hidden rounded-lg border border-[#d8dced] px-3 py-2 text-sm leading-6"
    />
  );
};

interface WaveformSegmentEditorProps {
  audioUrl: string;
  activeLineIndex: number | null;
  activeLine: TranscriptLine | null;
  currentMs: number;
  onCurrentMsChange: (value: number) => void;
  onRegionChange: (startMs: number, endMs: number) => void;
}

const WaveformSegmentEditor = ({
  audioUrl,
  activeLineIndex,
  activeLine,
  currentMs,
  onCurrentMsChange,
  onRegionChange,
}: WaveformSegmentEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const activeRegionRef = useRef<Region | null>(null);
  const activeLineIndexRef = useRef(activeLineIndex);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    activeLineIndexRef.current = activeLineIndex;
  }, [activeLineIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    setIsReady(false);
    setIsPlaying(false);
    const regions = RegionsPlugin.create();
    const wavesurfer = WaveSurfer.create({
      container,
      url: audioUrl,
      height: 96,
      waveColor: '#d6e4ff',
      progressColor: '#004ac6',
      cursorColor: '#0f172a',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      plugins: [regions],
    });

    wavesurferRef.current = wavesurfer;
    regionsRef.current = regions;

    const subscriptions = [
      wavesurfer.on('ready', () => {
        setIsReady(true);
        onCurrentMsChange(0);
      }),
      wavesurfer.on('timeupdate', (time) => onCurrentMsChange(Math.round(time * 1000))),
      wavesurfer.on('play', () => setIsPlaying(true)),
      wavesurfer.on('pause', () => setIsPlaying(false)),
      wavesurfer.on('finish', () => setIsPlaying(false)),
      regions.on('region-created', (region) => {
        if (activeRegionRef.current && activeRegionRef.current !== region) {
          activeRegionRef.current.remove();
        }
        activeRegionRef.current = region;
      }),
      regions.on('region-updated', (region) => {
        if (activeLineIndexRef.current === null) return;
        activeRegionRef.current = region;
        onRegionChange(Math.round(region.start * 1000), Math.round(region.end * 1000));
      }),
      regions.on('region-clicked', (region, event) => {
        event.stopPropagation();
        activeRegionRef.current = region;
        void region.play(true);
      }),
    ];

    const disableDragSelection = regions.enableDragSelection({
      color: 'rgba(0, 74, 198, 0.22)',
      drag: true,
      resize: true,
    });

    return () => {
      disableDragSelection();
      subscriptions.forEach((unsubscribe) => unsubscribe());
      wavesurfer.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
      activeRegionRef.current = null;
    };
  }, [audioUrl, onCurrentMsChange, onRegionChange]);

  useEffect(() => {
    const regions = regionsRef.current;
    const wavesurfer = wavesurferRef.current;
    if (!regions || !wavesurfer || !isReady) return;

    regions.clearRegions();
    activeRegionRef.current = null;

    if (!activeLine || activeLine.start_ms === null || activeLine.end_ms === null) return;

    activeRegionRef.current = regions.addRegion({
      start: activeLine.start_ms / 1000,
      end: activeLine.end_ms / 1000,
      color: 'rgba(0, 74, 198, 0.22)',
      drag: true,
      resize: true,
    });
  }, [activeLine, isReady]);

  const togglePlayback = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;
    void wavesurfer.playPause();
  };

  const playActiveRegion = () => {
    const region = activeRegionRef.current;
    if (!region) return;
    void region.play(true);
  };

  const seekToCurrentLineStart = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer || !activeLine?.start_ms) return;
    wavesurfer.setTime(activeLine.start_ms / 1000);
  };

  return (
    <div className="space-y-3 rounded-xl border border-[#d8dced] bg-[#f8fbff] p-4">
      <div ref={containerRef} className="min-h-[96px]" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            disabled={!isReady}
            className="rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {isPlaying ? 'Tạm dừng' : 'Phát audio'}
          </button>
          <button
            type="button"
            onClick={playActiveRegion}
            disabled={!activeRegionRef.current}
            className="rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#344054] disabled:opacity-40"
          >
            Phát line đang chọn
          </button>
          <button
            type="button"
            onClick={seekToCurrentLineStart}
            disabled={!activeLine?.start_ms}
            className="rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#344054] disabled:opacity-40"
          >
            Về đầu line
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#667085]">
          <span className="rounded bg-white px-2 py-1 text-[#004ac6]">Vị trí: {formatTimestamp(currentMs)}</span>
          <span>{activeLineIndex === null ? 'Chọn line rồi kéo vùng trên waveform.' : `Đang chỉnh Line ${activeLineIndex + 1}`}</span>
        </div>
      </div>
    </div>
  );
};

export const AdminListeningPage = () => {
  const [collections, setCollections] = useState<AdminListeningCollection[]>([]);
  const [tests, setTests] = useState<AdminListeningTest[]>([]);
  const [groups, setGroups] = useState<AdminListeningGroupSummary[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedPart, setSelectedPart] = useState<AdminListeningPartNumber>(1);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminListeningGroupDetail | null>(null);
  const [draftLines, setDraftLines] = useState<TranscriptLine[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [currentMs, setCurrentMs] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const activeLineIndexRef = useRef<number | null>(null);

  const selectedTest = tests.find((test) => test.id === selectedTestId) || null;
  const validationMessage = useMemo(() => validateLines(draftLines), [draftLines]);
  const activeLine = activeLineIndex === null ? null : draftLines[activeLineIndex] ?? null;

  useEffect(() => {
    activeLineIndexRef.current = activeLineIndex;
  }, [activeLineIndex]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoadingCollections(true);
        setError('');
        const data = await adminListeningService.getCollections();
        setCollections(data);
        setSelectedCollectionId(data[0]?.id ?? null);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải bộ đề.'));
      } finally {
        setLoadingCollections(false);
      }
    };

    void loadCollections();
  }, []);

  useEffect(() => {
    const loadTests = async () => {
      if (!selectedCollectionId) {
        setTests([]);
        setSelectedTestId(null);
        return;
      }

      try {
        setLoadingTests(true);
        setError('');
        const data = await adminListeningService.getTestsInCollection(selectedCollectionId);
        setTests(data);
        setSelectedTestId(data[0]?.id ?? null);
      } catch (err) {
        setTests([]);
        setSelectedTestId(null);
        setError(getErrorMessage(err, 'Không thể tải danh sách test.'));
      } finally {
        setLoadingTests(false);
      }
    };

    void loadTests();
  }, [selectedCollectionId]);

  const loadGroups = async (preferredGroupId?: number) => {
    if (!selectedTestId) {
      setGroups([]);
      setSelectedGroupId(null);
      setDetail(null);
      setDraftLines([]);
      return;
    }

    try {
      setLoadingGroups(true);
      setError('');
      const data = await adminListeningService.getGroups(selectedTestId, selectedPart);
      setGroups(data);
      const nextGroupId = preferredGroupId ?? data[0]?.id ?? null;
      setSelectedGroupId(nextGroupId);
      if (!nextGroupId) {
        setDetail(null);
        setDraftLines([]);
      }
    } catch (err) {
      setGroups([]);
      setSelectedGroupId(null);
      setDetail(null);
      setDraftLines([]);
      setError(getErrorMessage(err, 'Không thể tải group luyện nghe.'));
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, [selectedPart, selectedTestId]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedGroupId) return;

      try {
        setLoadingDetail(true);
        setError('');
        setSaveMessage('');
        const data = await adminListeningService.getGroupDetail(selectedGroupId);
        setDetail(data);
        setDraftLines((data.audio?.transcript_lines || []).map((line, index) => ({
          id: line.id,
          speaker: line.speaker ?? null,
          text_en: line.text_en ?? '',
          text_vi: line.text_vi ?? null,
          start_ms: line.start_ms ?? null,
          end_ms: line.end_ms ?? null,
          order_index: line.order_index ?? index,
        })));
        setActiveLineIndex(data.audio?.transcript_lines?.length ? 0 : null);
        setDirty(false);
      } catch (err) {
        setDetail(null);
        setDraftLines([]);
        setError(getErrorMessage(err, 'Không thể tải chi tiết group.'));
      } finally {
        setLoadingDetail(false);
      }
    };

    void loadDetail();
  }, [selectedGroupId]);

  const updateLines = (updater: (lines: TranscriptLine[]) => TranscriptLine[]) => {
    setDraftLines((current) => updater(current));
    setDirty(true);
    setSaveMessage('');
  };

  const updateLine = (index: number, patch: Partial<TranscriptLine>) => {
    updateLines((lines) => lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)));
  };

  const moveLine = (index: number, offset: number) => {
    updateLines((lines) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= lines.length) return lines;
      const next = [...lines];
      const [line] = next.splice(index, 1);
      next.splice(nextIndex, 0, line);
      return reindexLines(next);
    });
  };

  const setLineTimestamp = (index: number, field: 'start_ms' | 'end_ms') => {
    updateLine(index, { [field]: currentMs });
  };

  const updateActiveRegion = useCallback((startMs: number, endMs: number) => {
    const lineIndex = activeLineIndexRef.current;
    if (lineIndex === null) return;
    setDraftLines((lines) =>
      lines.map((line, index) => (index === lineIndex ? { ...line, start_ms: startMs, end_ms: endMs } : line))
    );
    setDirty(true);
    setSaveMessage('');
  }, []);

  const saveLines = async () => {
    if (!detail?.audio || validationMessage) return;

    try {
      setSaving(true);
      setError('');
      setSaveMessage('');
      const payload = draftLines
        .filter((line) => line.text_en.trim() || line.text_vi?.trim() || line.speaker?.trim())
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((line, index) => ({
          id: line.id,
          speaker: line.speaker?.trim() || null,
          text_en: line.text_en.trim(),
          text_vi: line.text_vi?.trim() || null,
          start_ms: line.start_ms,
          end_ms: line.end_ms,
          order_index: index,
        }));
      const nextDetail = await adminListeningService.updateTranscriptLines(detail.id, payload);
      setDetail(nextDetail);
      setDraftLines(nextDetail.audio?.transcript_lines || payload);
      setDirty(false);
      setSaveMessage('Đã lưu transcript lines.');
      await loadGroups(detail.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu transcript lines.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#004ac6]">
              <Headphones className="h-4 w-4" />
              Luyện nghe
            </div>
            <h1 className="text-2xl font-black text-[#101828]">Quản lý transcript nghe chép</h1>
            <p className="mt-1 text-sm font-semibold text-[#667085]">
              Chọn test, Part 1-4 và nhập transcript lines theo từng question group.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadGroups(selectedGroupId ?? undefined)}
            disabled={!selectedTestId || loadingGroups}
            className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#344054] disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loadingGroups ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[#fecdca] bg-[#fff1f0] px-4 py-3 text-sm font-semibold text-[#b42318]">
            {error}
          </div>
        )}

        <section className="mb-5 grid gap-3 bg-white p-4 shadow-sm ring-1 ring-[#e4e7ec] md:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-bold uppercase text-[#667085]">
            Bộ đề
            <select
              value={selectedCollectionId ?? ''}
              onChange={(event) => setSelectedCollectionId(Number(event.target.value) || null)}
              disabled={loadingCollections}
              className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold normal-case text-[#101828]"
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold uppercase text-[#667085]">
            Test
            <select
              value={selectedTestId ?? ''}
              onChange={(event) => setSelectedTestId(Number(event.target.value) || null)}
              disabled={loadingTests}
              className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold normal-case text-[#101828]"
            >
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            {parts.map((part) => (
              <button
                key={part}
                type="button"
                onClick={() => setSelectedPart(part)}
                className={`h-10 rounded-lg border px-3 text-sm font-black ${
                  selectedPart === part
                    ? 'border-[#004ac6] bg-[#004ac6] text-white'
                    : 'border-[#d8dced] bg-white text-[#344054]'
                }`}
              >
                Part {part}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-h-[680px] bg-white p-4 shadow-sm ring-1 ring-[#e4e7ec]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#101828]">Question Groups</h2>
                <p className="mt-1 text-xs font-semibold text-[#667085]">
                  {selectedTest ? selectedTest.title : 'Chưa chọn test'}
                </p>
              </div>
              {loadingGroups && <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />}
            </div>
            <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {!loadingGroups && groups.length === 0 && (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-sm font-semibold text-[#667085]">
                  <Search className="mb-3 h-8 w-8 text-[#98a2b3]" />
                  Part này chưa có group luyện nghe.
                </div>
              )}
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full border p-3 text-left transition ${
                    selectedGroupId === group.id
                      ? 'border-[#004ac6] bg-[#eef4ff]'
                      : 'border-[#e4e7ec] bg-white hover:bg-[#f9fafb]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#101828]">Group {group.group_order}</span>
                    <span className="text-xs font-bold text-[#667085]">
                      Q: {formatQuestionNumbers(group.question_numbers)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded px-2 py-1 text-[11px] font-bold ${
                      group.has_audio === false ? 'bg-[#fff1f0] text-[#b42318]' : 'bg-[#eef4ff] text-[#004ac6]'
                    }`}>
                      {group.has_audio === false ? 'Chưa có audio' : 'Có audio'}
                    </span>
                    <span className={`rounded px-2 py-1 text-[11px] font-bold ${
                      group.has_transcript_lines ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fff4e5] text-[#b25e00]'
                    }`}>
                      {group.transcript_line_count ?? 0} line
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-h-[680px] bg-white p-5 shadow-sm ring-1 ring-[#e4e7ec]">
            {loadingDetail ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" />
                <p className="text-sm font-bold text-[#667085]">Đang tải transcript...</p>
              </div>
            ) : !detail ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center text-sm font-semibold text-[#667085]">
                <Headphones className="mb-3 h-10 w-10 text-[#98a2b3]" />
                Chọn một group để nhập transcript lines.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0f5] pb-4">
                  <div>
                    <h2 className="text-lg font-black text-[#101828]">
                      Part {detail.part_number} - Group {detail.group_order}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[#667085]">
                      Question: {formatQuestionNumbers(detail.question_numbers)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {saveMessage && <span className="text-xs font-bold text-[#027a48]">{saveMessage}</span>}
                    {dirty && <span className="text-xs font-bold text-[#b25e00]">Có thay đổi chưa lưu</span>}
                    <button
                      type="button"
                      onClick={() => void saveLines()}
                      disabled={saving || !detail.audio || Boolean(validationMessage)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Lưu transcript
                    </button>
                  </div>
                </div>

                {!detail.audio ? (
                  <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-4 text-sm font-semibold text-[#b42318]">
                    Group này chưa có audio. Hãy gắn audio trong phần quản lý đề thi trước khi nhập transcript lines.
                  </div>
                ) : (
                  <>
                    {detail.audio.url && (
                      <div className="sticky top-4 z-20 bg-white pb-3">
                        <WaveformSegmentEditor
                          audioUrl={detail.audio.url}
                          activeLineIndex={activeLineIndex}
                          activeLine={activeLine}
                          currentMs={currentMs}
                          onCurrentMsChange={setCurrentMs}
                          onRegionChange={updateActiveRegion}
                        />
                      </div>
                    )}

                    {(detail.audio.transcript_en || detail.audio.transcript_vi) && (
                      <details className="border border-[#e4e7ec] bg-[#f9fafb] p-3">
                        <summary className="cursor-pointer text-xs font-black uppercase text-[#475467]">
                          Transcript tổng cũ
                        </summary>
                        {detail.audio.transcript_en && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#344054]">
                            {detail.audio.transcript_en}
                          </p>
                        )}
                        {detail.audio.transcript_vi && (
                          <p className="mt-3 whitespace-pre-wrap border-t border-[#e4e7ec] pt-3 text-sm leading-6 text-[#667085]">
                            {detail.audio.transcript_vi}
                          </p>
                        )}
                      </details>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-[#101828]">Transcript Lines</h3>
                        {validationMessage && (
                          <p className="mt-1 text-sm font-semibold text-[#b42318]">{validationMessage}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLineIndex(draftLines.length);
                          updateLines((lines) => [...lines, createEmptyLine(lines.length)]);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-bold text-[#344054]"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm line
                      </button>
                    </div>

                    <div className="space-y-3">
                      {draftLines.length === 0 && (
                        <div className="border border-dashed border-[#d8dced] p-6 text-center text-sm font-semibold text-[#667085]">
                          Chưa có transcript line.
                        </div>
                      )}
                      {draftLines.map((line, index) => (
                        <div
                          key={line.id ?? `line-${index}`}
                          onClick={() => setActiveLineIndex(index)}
                          className={`border p-3 transition ${
                            activeLineIndex === index ? 'border-[#004ac6] bg-[#f8fbff]' : 'border-[#e4e7ec] bg-white'
                          }`}
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded bg-[#eef4ff] px-2 py-1 text-xs font-black text-[#004ac6]">
                              Line {index + 1}{activeLineIndex === index ? ' - đang chỉnh' : ''}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => moveLine(index, -1)} className="rounded p-1.5 text-[#667085] hover:bg-[#f2f4f7]" aria-label="Đưa lên">
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => moveLine(index, 1)} className="rounded p-1.5 text-[#667085] hover:bg-[#f2f4f7]" aria-label="Đưa xuống">
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateLines((lines) => {
                                    const next = [...lines];
                                    next.splice(index + 1, 0, { ...line, id: undefined, order_index: index + 1 });
                                    return reindexLines(next);
                                  })
                                }
                                className="rounded p-1.5 text-[#667085] hover:bg-[#f2f4f7]"
                                aria-label="Nhân bản"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  updateLines((lines) => reindexLines(lines.filter((_, lineIndex) => lineIndex !== index)));
                                  setActiveLineIndex((current) => {
                                    if (current === null) return null;
                                    if (current === index) return null;
                                    return current > index ? current - 1 : current;
                                  });
                                }}
                                className="rounded p-1.5 text-[#b42318] hover:bg-[#fff1f0]"
                                aria-label="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-3 xl:grid-cols-2">
                            <AutoGrowingTextarea
                              value={line.text_en}
                              onChange={(value) => updateLine(index, { text_en: value })}
                              placeholder="text_en"
                            />
                            <AutoGrowingTextarea
                              value={line.text_vi ?? ''}
                              onChange={(value) => updateLine(index, { text_vi: value || null })}
                              placeholder="text_vi"
                            />
                          </div>

                          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                            <label className="text-xs font-bold uppercase text-[#667085]">
                              Bắt đầu (giây)
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={formatSecondsInput(line.start_ms)}
                                onChange={(event) => updateLine(index, { start_ms: parseSecondsToMs(event.target.value) })}
                                className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold normal-case text-[#101828]"
                              />
                              <button
                                type="button"
                                onClick={() => setLineTimestamp(index, 'start_ms')}
                                className="mt-2 rounded-md border border-[#d8dced] px-2 py-1 text-[11px] font-bold normal-case text-[#344054]"
                              >
                                Lấy mốc hiện tại
                              </button>
                            </label>
                            <label className="text-xs font-bold uppercase text-[#667085]">
                              Kết thúc (giây)
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={formatSecondsInput(line.end_ms)}
                                onChange={(event) => updateLine(index, { end_ms: parseSecondsToMs(event.target.value) })}
                                className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold normal-case text-[#101828]"
                              />
                              <button
                                type="button"
                                onClick={() => setLineTimestamp(index, 'end_ms')}
                                className="mt-2 rounded-md border border-[#d8dced] px-2 py-1 text-[11px] font-bold normal-case text-[#344054]"
                              >
                                Lấy mốc hiện tại
                              </button>
                            </label>
                            <div className="flex flex-wrap items-end gap-2">
                              <span className="pb-2 text-xs font-bold text-[#667085]">
                                {formatTimestamp(line.start_ms)} - {formatTimestamp(line.end_ms)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
