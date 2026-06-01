import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, MouseEventHandler, ReactNode } from 'react';
import { ArrowRight, BookText, Edit3, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminVocabularyService, getVocabularyErrorMessage } from '../services/vocabularyService';
import type { VocabularyTopic } from '../types';

const emptyForm = { name: '', description: '' };

export const AdminVocabularyTopicsPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [editingTopic, setEditingTopic] = useState<VocabularyTopic | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTopics = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setTopics(await adminVocabularyService.getTopics());
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể tải danh sách chủ đề.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTopics();
  }, []);

  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter((topic) =>
      [topic.name, topic.description ?? ''].some((value) => value.toLowerCase().includes(query))
    );
  }, [searchQuery, topics]);

  const totalWords = topics.reduce((sum, topic) => sum + topic.wordCount, 0);

  const openCreate = () => {
    setEditingTopic(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setErrorMsg('');
  };

  const openEdit = (topic: VocabularyTopic) => {
    setEditingTopic(topic);
    setForm({ name: topic.name, description: topic.description ?? '' });
    setIsFormOpen(true);
    setErrorMsg('');
  };

  const closeForm = () => {
    setEditingTopic(null);
    setForm(emptyForm);
    setIsFormOpen(false);
    setErrorMsg('');
  };

  const submitTopic = async (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setErrorMsg('Tên chủ đề là bắt buộc.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const payload = { name, description: form.description.trim() };
      if (editingTopic) {
        const nextTopic = await adminVocabularyService.updateTopic(editingTopic.id, payload);
        setTopics((current) => current.map((topic) => (topic.id === nextTopic.id ? nextTopic : topic)));
      } else {
        const nextTopic = await adminVocabularyService.createTopic(payload);
        setTopics((current) => [nextTopic, ...current]);
      }
      closeForm();
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể lưu chủ đề.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteTopic = async (topic: VocabularyTopic) => {
    if (!window.confirm(`Xóa chủ đề "${topic.name}"? Từ vựng sẽ không bị xóa.`)) return;
    try {
      setErrorMsg('');
      await adminVocabularyService.deleteTopic(topic.id);
      setTopics((current) => current.filter((item) => item.id !== topic.id));
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể xóa chủ đề.'));
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-7 text-[#101828] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#004ac6]">Quản trị từ vựng</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#101828]">Chủ đề từ vựng</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#667085]">
              Tạo chủ đề, theo dõi số lượng từ và mở từng chủ đề để import hoặc chỉnh sửa danh sách từ vựng.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#004ac6] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#003da3]"
          >
            <Plus className="h-4 w-4" />
            Tạo chủ đề
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Tổng chủ đề" value={topics.length} />
          <SummaryCard label="Tổng số từ" value={totalWords} />
          <SummaryCard label="Đang hiển thị" value={filteredTopics.length} />
        </section>

        {errorMsg && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#b42318]">
            {errorMsg}
          </div>
        )}

        {isFormOpen && (
          <section className="rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#101828]">{editingTopic ? 'Cập nhật chủ đề' : 'Tạo chủ đề mới'}</h2>
                <p className="mt-1 text-sm font-medium text-[#667085]">Tên chủ đề sẽ được hiển thị cho học viên.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dced] text-[#667085] transition hover:bg-[#f2f4f7]"
                aria-label="Đóng form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submitTopic} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_auto] lg:items-end">
              <Field
                label="Tên chủ đề"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder="Business"
              />
              <Field
                label="Mô tả"
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
                placeholder="Từ vựng thường gặp trong môi trường công sở"
              />
              <button
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#004ac6] px-5 text-sm font-black text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingTopic ? 'Lưu thay đổi' : 'Tạo chủ đề'}
              </button>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#d8dced] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#e4e7ec] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#101828]">Danh sách chủ đề</h2>
              <p className="mt-1 text-sm font-medium text-[#667085]">Bấm vào một dòng để xem danh sách từ trong chủ đề.</p>
            </div>
            <div className="relative w-full lg:max-w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm chủ đề..."
                className="h-11 w-full rounded-xl border border-[#d8dced] bg-white pl-10 pr-3 text-sm font-bold outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#eaf0ff]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#004ac6]" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                  <tr>
                    <th className="px-5 py-3">Chủ đề</th>
                    <th className="px-5 py-3">Mô tả</th>
                    <th className="w-32 px-5 py-3">Số từ</th>
                    <th className="w-32 px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e7ec]">
                  {filteredTopics.map((topic) => (
                    <tr
                      key={topic.id}
                      onClick={() => navigate(`/admin/vocabulary/topics/${topic.id}`)}
                      className="cursor-pointer transition hover:bg-[#f8fbff]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#004ac6]">
                            <BookText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#101828]">{topic.name}</p>
                            <p className="text-xs font-bold text-[#98a2b3]">Mở danh sách từ</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#98a2b3]" />
                        </div>
                      </td>
                      <td className="max-w-[420px] px-5 py-4 text-[#667085]">
                        <p className="line-clamp-2">{topic.description || 'Chưa có mô tả.'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-[#f2f4f7] px-2.5 py-1 text-xs font-black text-[#344054]">
                          {topic.wordCount} từ
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            label="Sửa chủ đề"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(topic);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            danger
                            label="Xóa chủ đề"
                            onClick={(event) => {
                              event.stopPropagation();
                              void deleteTopic(topic);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
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

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <article className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
    <p className="text-xs font-black uppercase text-[#667085]">{label}</p>
    <p className="mt-1 text-2xl font-black text-[#101828]">{value}</p>
  </article>
);

const Field = ({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) => (
  <label className="block">
    <span className="text-xs font-black uppercase text-[#667085]">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-1 h-11 w-full rounded-xl border border-[#d8dced] px-3 text-sm font-bold outline-none transition placeholder:text-[#98a2b3] focus:border-[#004ac6] focus:ring-2 focus:ring-[#eaf0ff]"
    />
  </label>
);

const IconButton = ({
  children,
  danger,
  label,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
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

const EmptyState = () => (
  <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
    <BookText className="h-10 w-10 text-[#98a2b3]" />
    <h3 className="mt-3 text-base font-black text-[#101828]">Chưa có chủ đề phù hợp</h3>
    <p className="mt-1 text-sm font-medium text-[#667085]">Tạo chủ đề mới hoặc thử từ khóa khác.</p>
  </div>
);
