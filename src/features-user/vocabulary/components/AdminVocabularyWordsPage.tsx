import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEventHandler, ReactNode } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  Volume2,
  Wand2,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminVocabularyService, getVocabularyErrorMessage, vocabularyService } from '../services/vocabularyService';
import type { Vocabulary, VocabularyPayload, VocabularyTopic } from '../types';

type WordForm = {
  word: string;
  meaningVi: string;
  partOfSpeech: string;
  pronunciation: string;
  exampleSentenceEn: string;
  exampleSentenceVi: string;
  audioUrl: string;
  topicIds: number[];
};

const emptyForm: WordForm = {
  word: '',
  meaningVi: '',
  partOfSpeech: '',
  pronunciation: '',
  exampleSentenceEn: '',
  exampleSentenceVi: '',
  audioUrl: '',
  topicIds: [],
};

const toPayload = (form: WordForm): VocabularyPayload => ({
  word: form.word.trim(),
  meaning_vi: form.meaningVi.trim(),
  part_of_speech: form.partOfSpeech.trim(),
  pronunciation: form.pronunciation.trim(),
  example_sentence_en: form.exampleSentenceEn.trim(),
  example_sentence_vi: form.exampleSentenceVi.trim(),
  audio_url: form.audioUrl.trim(),
  topic_ids: form.topicIds,
});

const toForm = (word: Vocabulary): WordForm => ({
  word: word.word,
  meaningVi: word.meaningVi ?? '',
  partOfSpeech: word.partOfSpeech ?? '',
  pronunciation: word.pronunciation ?? '',
  exampleSentenceEn: word.exampleSentenceEn ?? '',
  exampleSentenceVi: word.exampleSentenceVi ?? '',
  audioUrl: word.audioUrl ?? '',
  topicIds: word.topics.map((topic) => topic.id),
});

const playAudio = (url: string | null) => {
  if (!url) return;
  void new Audio(url).play();
};

export const AdminVocabularyWordsPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const routeTopicId = topicId ? Number(topicId) : null;
  const selectedTopicId = routeTopicId && Number.isFinite(routeTopicId) ? routeTopicId : undefined;
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [form, setForm] = useState<WordForm>(() => ({ ...emptyForm, topicIds: selectedTopicId ? [selectedTopicId] : [] }));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [importing, setImporting] = useState(false);
  const [expandedWordIds, setExpandedWordIds] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const nextTopics = await adminVocabularyService.getTopics();
      let loadedWords: Vocabulary[];

      if (selectedTopicId) {
        try {
          loadedWords = await adminVocabularyService.searchWords({
            topicId: selectedTopicId,
            keyword: keyword.trim() || undefined,
          });
        } catch {
          loadedWords = await vocabularyService.getTopicWords(selectedTopicId);
        }
      } else {
        loadedWords = await adminVocabularyService.searchWords({ keyword: keyword.trim() || undefined });
      }

      const query = keyword.trim().toLowerCase();
      const nextWords = query
        ? loadedWords.filter((word) =>
            [word.word, word.meaningVi ?? '', word.meaningEn ?? '', word.partOfSpeech ?? '', word.exampleSentenceEn ?? ''].some((value) =>
              value.toLowerCase().includes(query)
            )
          )
        : loadedWords;

      setTopics(nextTopics);
      setWords(nextWords);
      setExpandedWordIds({});
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể tải danh sách từ vựng.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [topicId]);

  const selectedTopic = useMemo(
    () => topics.find((topic) => selectedTopicId && topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topics]
  );

  const getEmptyFormForRoute = (): WordForm => ({ ...emptyForm, topicIds: selectedTopicId ? [selectedTopicId] : [] });

  const openCreate = () => {
    setForm(getEmptyFormForRoute());
    setIsFormOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const closeForm = () => {
    setForm(getEmptyFormForRoute());
    setIsFormOpen(false);
    setErrorMsg('');
  };

  const submitWord = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.word.trim()) {
      setErrorMsg('Từ vựng là bắt buộc.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const payload = toPayload(form);
      const nextWord = await adminVocabularyService.createWord(payload);
      if (!selectedTopicId || nextWord.topics.some((topic) => topic.id === selectedTopicId)) {
        setWords((current) => [nextWord, ...current]);
      }
      setSuccessMsg(`Đã tạo từ "${nextWord.word}".`);
      closeForm();
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể lưu từ vựng.'));
    } finally {
      setSaving(false);
    }
  };

  const lookupWord = async () => {
    const word = form.word.trim();
    if (!word) {
      setErrorMsg('Nhập từ tiếng Anh trước khi tra cứu.');
      return;
    }
    try {
      setLookingUp(true);
      setErrorMsg('');
      const lookup = await adminVocabularyService.lookup(word);
      setForm((current) => ({
        ...current,
        word: lookup.word || current.word,
        meaningVi: lookup.meaningVi ?? current.meaningVi,
        partOfSpeech: lookup.partOfSpeech ?? current.partOfSpeech,
        pronunciation: lookup.pronunciation ?? current.pronunciation,
        exampleSentenceEn: lookup.exampleSentenceEn ?? current.exampleSentenceEn,
        exampleSentenceVi: lookup.exampleSentenceVi ?? current.exampleSentenceVi,
        audioUrl: lookup.audioUrl ?? current.audioUrl,
      }));
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể tra cứu từ này.'));
    } finally {
      setLookingUp(false);
    }
  };

  const deleteWord = async (word: Vocabulary) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await adminVocabularyService.deleteWord(word.id);
      setWords((current) => current.filter((item) => item.id !== word.id));
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể xóa từ vựng.'));
    }
  };

  const toggleExpanded = (wordId: number) => {
    setExpandedWordIds((current) => ({ ...current, [wordId]: !current[wordId] }));
  };

  const handleImport = async (file?: File | null) => {
    if (!selectedTopicId) {
      setErrorMsg('Chọn chủ đề trước khi import.');
      return;
    }
    if (!file) {
      setErrorMsg('Chọn file .xlsx, .xls hoặc .csv trước khi import.');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setSuccessMsg('');
      const result = await adminVocabularyService.importTopicWords(selectedTopicId, file, false);
      setSuccessMsg(`Import xong ${result.totalRows} dòng: tạo ${result.createdCount}, cập nhật ${result.updatedCount}, bỏ qua ${result.skippedCount}.`);
      await loadData();
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể import danh sách từ.'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-7 text-[#101828] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px] space-y-5">
        <header>
          <div className="mt-1 flex items-center gap-3">
            <Link to="/admin/vocabulary" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8dced] bg-white text-[#667085] transition hover:bg-[#f8fafc] hover:text-[#101828]" title="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-[#101828]">
              {selectedTopic ? selectedTopic.name : 'Danh sách từ vựng'}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#667085]">
            {selectedTopic?.description || 'Quản lý từ, tra cứu dữ liệu, dịch nghĩa và gắn từ vào các chủ đề.'}
          </p>
        </header>

        {errorMsg && <Notice tone="error">{errorMsg}</Notice>}
        {successMsg && <Notice tone="success">{successMsg}</Notice>}


        {isFormOpen && (
          <section className="rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-black text-[#101828]">Thêm từ mới</h2>
              <p className="mt-1 text-sm font-medium text-[#667085]">Có thể tra cứu tự động rồi chỉnh lại thủ công trước khi lưu.</p>
            </div>
            <form onSubmit={submitWord} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Từ vựng" value={form.word} onChange={(value) => setForm((current) => ({ ...current, word: value }))} required />
                <Field label="Từ loại" value={form.partOfSpeech} onChange={(value) => setForm((current) => ({ ...current, partOfSpeech: value }))} placeholder="noun, verb..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nghĩa tiếng Việt" value={form.meaningVi} onChange={(value) => setForm((current) => ({ ...current, meaningVi: value }))} />
                <PronunciationField
                  audioUrl={form.audioUrl}
                  value={form.pronunciation}
                  onChange={(value) => setForm((current) => ({ ...current, pronunciation: value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Ví dụ tiếng Anh" value={form.exampleSentenceEn} onChange={(value) => setForm((current) => ({ ...current, exampleSentenceEn: value }))} />
                <Field label="Ví dụ tiếng Việt" value={form.exampleSentenceVi} onChange={(value) => setForm((current) => ({ ...current, exampleSentenceVi: value }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton type="submit" disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}>
                  Lưu từ
                </ActionButton>
                <ActionButton
                  type="button"
                  variant="secondary"
                  disabled={lookingUp}
                  onClick={() => void lookupWord()}
                  icon={lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                >
                  Tra cứu & dịch nghĩa
                </ActionButton>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#d8dced] bg-white shadow-sm">
          <div className="grid gap-3 border-b border-[#e4e7ec] p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm từ, nghĩa, ví dụ..."
                className="h-11 w-full rounded-xl border border-[#d8dced] bg-white pl-10 pr-3 text-sm font-bold outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#eaf0ff]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => void loadData()} icon={<Search className="h-4 w-4" />}>
                Tìm kiếm
              </ActionButton>
              <ActionButton onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
                Thêm từ
              </ActionButton>
              {selectedTopicId && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(event) => void handleImport(event.target.files?.[0])}
                  />
                  <ActionButton
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    icon={importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  >
                    Import
                  </ActionButton>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#004ac6]" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
              <Search className="h-10 w-10 text-[#98a2b3]" />
              <h3 className="mt-3 text-base font-black text-[#101828]">Chưa có từ vựng</h3>
              <p className="mt-1 text-sm font-medium text-[#667085]">Import file hoặc thêm từ mới vào chủ đề này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                  <tr>
                    <th className="px-5 py-3">Từ vựng</th>
                    <th className="px-5 py-3">Từ loại</th>
                    <th className="px-5 py-3">Nghĩa chính</th>
                    <th className="w-32 px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e7ec]">
                  {words.map((word) => (
                    <Fragment key={word.id}>
                      <tr className="transition hover:bg-[#f8fbff]">
                        <td className="px-5 py-4">
                          <p className="text-base font-black text-[#101828]">{word.word}</p>
                          {word.pronunciation && <p className="text-xs font-bold text-[#667085]">{word.pronunciation}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-[#344054]">{word.partOfSpeech || '-'}</span>
                        </td>
                        <td className="max-w-[360px] px-5 py-4 text-[#667085]">
                          <p className="line-clamp-2 font-bold text-[#344054]">{word.meaningVi || 'Chưa có nghĩa.'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <IconButton label={expandedWordIds[word.id] ? 'Thu gọn' : 'Xem chi tiết'} onClick={() => toggleExpanded(word.id)}>
                              {expandedWordIds[word.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                      {expandedWordIds[word.id] && (
                        <InlineWordEditForm
                          word={word}
                          onDelete={deleteWord}
                          onSave={(updatedWord) => {
                            setWords((current) => current.map((w) => (w.id === updatedWord.id ? updatedWord : w)));
                            setSuccessMsg(`Đã cập nhật từ "${updatedWord.word}".`);
                            toggleExpanded(word.id);
                          }}
                        />
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const Field = ({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) => (
  <label className="block">
    <span className="text-xs font-black uppercase text-[#667085]">{label}</span>
    <input
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-1 h-11 w-full rounded-xl border border-[#d8dced] px-3 text-sm font-bold outline-none transition placeholder:text-[#98a2b3] focus:border-[#004ac6] focus:ring-2 focus:ring-[#eaf0ff]"
    />
  </label>
);

const PronunciationField = ({
  audioUrl,
  onChange,
  value,
}: {
  audioUrl: string;
  onChange: (value: string) => void;
  value: string;
}) => (
  <label className="block">
    <span className="text-xs font-black uppercase text-[#667085]">Phiên âm</span>
    <div className="mt-1 flex h-11 overflow-hidden rounded-xl border border-[#d8dced] bg-white transition focus-within:border-[#004ac6] focus-within:ring-2 focus-within:ring-[#eaf0ff]">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/.../"
        className="min-w-0 flex-1 px-3 text-sm font-bold outline-none placeholder:text-[#98a2b3]"
      />
      <button
        type="button"
        onClick={() => playAudio(audioUrl)}
        disabled={!audioUrl}
        className="flex h-full w-11 items-center justify-center border-l border-[#d8dced] text-[#004ac6] transition hover:bg-[#eaf0ff] disabled:cursor-not-allowed disabled:text-[#98a2b3] disabled:hover:bg-white"
        aria-label="Nghe phiên âm"
        title="Nghe phiên âm"
      >
        <Volume2 className="h-4 w-4" />
      </button>
    </div>
  </label>
);

const ActionButton = ({
  children,
  disabled,
  icon,
  onClick,
  type = 'button',
  variant = 'primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) => {
  const className =
    variant === 'primary'
      ? 'bg-[#004ac6] text-white hover:bg-[#003da3]'
      : variant === 'secondary'
        ? 'border border-[#d8dced] bg-white text-[#004ac6] hover:bg-[#eaf0ff]'
        : variant === 'danger'
          ? 'border border-[#fecaca] bg-white text-[#d92d20] hover:bg-[#fff1f2]'
          : 'border border-[#d8dced] bg-white text-[#344054] hover:bg-[#f8fafc]';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

const IconButton = ({
  children,
  danger,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60 ${
      danger
        ? 'border-[#fecaca] text-[#d92d20] hover:bg-[#fff1f2]'
        : 'border-[#d8dced] text-[#004ac6] hover:bg-[#eaf0ff]'
    }`}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

const Notice = ({ children, tone }: { children: ReactNode; tone: 'error' | 'success' }) => (
  <div
    className={`rounded-xl border px-4 py-3 text-sm font-bold ${
      tone === 'error' ? 'border-[#fecaca] bg-[#fff1f2] text-[#b42318]' : 'border-[#abefc6] bg-[#ecfdf3] text-[#027a48]'
    }`}
  >
    {children}
  </div>
);

const InlineWordEditForm = ({
  word,
  onDelete,
  onSave,
}: {
  word: Vocabulary;
  onDelete: (word: Vocabulary) => Promise<void>;
  onSave: (word: Vocabulary) => void;
}) => {
  const [form, setForm] = useState(() => toForm(word));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const submitWord = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.word.trim()) {
      setErrorMsg('Từ vựng là bắt buộc.');
      return;
    }
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const payload = toPayload(form);
      const nextWord = await adminVocabularyService.updateWord(word.id, payload);
      onSave(nextWord);
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể lưu từ vựng.'));
    } finally {
      setSaving(false);
    }
  };

  const lookupWord = async () => {
    const w = form.word.trim();
    if (!w) {
      setErrorMsg('Nhập từ tiếng Anh trước khi tra cứu.');
      return;
    }
    try {
      setLookingUp(true);
      setErrorMsg('');
      const lookup = await adminVocabularyService.lookup(w);
      setForm((current) => ({
        ...current,
        word: lookup.word || current.word,
        meaningVi: lookup.meaningVi ?? current.meaningVi,
        partOfSpeech: lookup.partOfSpeech ?? current.partOfSpeech,
        pronunciation: lookup.pronunciation ?? current.pronunciation,
        exampleSentenceEn: lookup.exampleSentenceEn ?? current.exampleSentenceEn,
        exampleSentenceVi: lookup.exampleSentenceVi ?? current.exampleSentenceVi,
        audioUrl: lookup.audioUrl ?? current.audioUrl,
      }));
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể tra cứu từ này.'));
    } finally {
      setLookingUp(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(word);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr>
      <td className="bg-[#fbfcff] p-0" colSpan={4}>
        <form onSubmit={submitWord} className="space-y-4 border border-t-0 border-[#d8dced] bg-white p-5">
          {errorMsg && <Notice tone="error">{errorMsg}</Notice>}
          {successMsg && <Notice tone="success">{successMsg}</Notice>}
          
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Từ vựng" value={form.word} onChange={(value) => setForm((current) => ({ ...current, word: value }))} required />
            <Field label="Từ loại" value={form.partOfSpeech} onChange={(value) => setForm((current) => ({ ...current, partOfSpeech: value }))} placeholder="noun, verb..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nghĩa tiếng Việt" value={form.meaningVi} onChange={(value) => setForm((current) => ({ ...current, meaningVi: value }))} />
            <PronunciationField
              audioUrl={form.audioUrl}
              value={form.pronunciation}
              onChange={(value) => setForm((current) => ({ ...current, pronunciation: value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ví dụ tiếng Anh" value={form.exampleSentenceEn} onChange={(value) => setForm((current) => ({ ...current, exampleSentenceEn: value }))} />
            <Field label="Ví dụ tiếng Việt" value={form.exampleSentenceVi} onChange={(value) => setForm((current) => ({ ...current, exampleSentenceVi: value }))} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <ActionButton type="submit" disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}>
              Lưu thay đổi
            </ActionButton>
            <ActionButton
              type="button"
              variant="secondary"
              disabled={lookingUp}
              onClick={() => void lookupWord()}
              icon={lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            >
              Tra cứu & dịch nghĩa
            </ActionButton>
            <ActionButton
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={() => setDeleteConfirmOpen(true)}
              icon={deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            >
              Xóa từ
            </ActionButton>
          </div>
        </form>
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          title="Xóa từ vựng?"
          message={`Xóa từ "${word.word}"?`}
          confirmLabel="Xóa"
          loading={deleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={() => void handleDelete()}
        />
      </td>
    </tr>
  );
};
