import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  ArrowRight,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { teacherTestService } from '../services/teacherTestService';
import type { TestCollection, Test } from '../types/teacherTestTypes';

export const TestListPage = () => {
  const [collections, setCollections] = useState<TestCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<TestCollection | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  
  // Loading states
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = (err as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const res = await teacherTestService.getCollections();
      if (res.code === 1000) {
        setCollections(res.result || []);
        // Select first collection by default if available
        if (res.result && res.result.length > 0 && !selectedCollection) {
          setSelectedCollection(res.result[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bộ đề:', err);
    } finally {
      setLoadingCollections(false);
    }
  };

  const fetchTests = async (collectionId: number) => {
    try {
      setLoadingTests(true);
      const res = await teacherTestService.getTestsInCollection(collectionId);
      if (res.code === 1000) {
        const retrievedTests = res.result || [];
        setTests(retrievedTests);
        retrievedTests.forEach((test) => {
          localStorage.setItem(`enghub_test_${test.id}`, JSON.stringify(test));
        });
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đề thi:', err);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      setErrorMsg('Vui lòng nhập tên bộ đề');
      return;
    }

    try {
      setCreatingCollection(true);
      setErrorMsg('');
      const res = await teacherTestService.createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim(),
      });

      if (res.code === 1000) {
        const created = res.result;
        setCollections((prev) => [...prev, created]);
        setSelectedCollection(created);
        setIsModalOpen(false);
        setNewCollectionName('');
        setNewCollectionDesc('');
      } else {
        setErrorMsg(res.message || 'Tạo bộ đề thất bại');
      }
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Có lỗi xảy ra khi kết nối máy chủ'));
    } finally {
      setCreatingCollection(false);
    }
  };

  // Fetch collections on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCollections();
  }, []);

  // Fetch tests when selected collection changes
  useEffect(() => {
    if (selectedCollection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchTests(selectedCollection.id);
    } else {
      setTests([]);
    }
  }, [selectedCollection]);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 bg-[#f6f7fc] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Quản lý đề thi TOEIC</h1>
            <p className="mt-2 text-sm text-[#667085]">Thiết lập bộ sưu tập, tải lên và cấu hình chi tiết đề thi dành cho học viên.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all shadow-sm"
            >
              <FolderPlus className="h-4.5 w-4.5 text-[#505f76]" />
              Tạo bộ đề mới
            </button>
            {selectedCollection && (
              <Link
                to={`/teacher/tests/create?collectionId=${selectedCollection.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#004ac6] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#003da3] transition-all"
              >
                <Plus className="h-4.5 w-4.5" />
                Tạo đề thi mới
              </Link>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar: Collections List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#d8dced] p-5 shadow-sm self-start">
            <div className="flex items-center justify-between pb-4 border-b border-[#f3f5fb]">
              <span className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <FolderOpen className="h-4.5 w-4.5 text-[#004ac6]" />
                Bộ sưu tập đề thi ({collections.length})
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loadingCollections ? (
                <div className="py-8 text-center text-sm text-[#667085]">Đang tải bộ sưu tập...</div>
              ) : collections.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="h-8 w-8 text-[#98a2b3] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#667085]">Chưa có bộ đề nào</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-3 text-xs font-bold text-[#004ac6] hover:underline"
                  >
                    + Tạo bộ đề đầu tiên
                  </button>
                </div>
              ) : (
                collections.map((col) => {
                  const isSelected = selectedCollection?.id === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setSelectedCollection(col)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#eaf0ff] text-[#004ac6] border border-transparent shadow-sm'
                          : 'bg-white hover:bg-[#f9fafb] border border-[#f3f5fb] text-[#344054]'
                      }`}
                    >
                      <span className="font-bold text-sm leading-tight block break-words">
                        {col.name}
                      </span>
                      {col.description && (
                        <span className={`text-xs block line-clamp-2 ${isSelected ? 'text-[#004ac6]/80' : 'text-[#667085]'}`}>
                          {col.description}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Tests in selected collection */}
          <div className="lg:col-span-8 space-y-6">
            {selectedCollection ? (
              <div className="bg-white rounded-2xl border border-[#d8dced] p-6 shadow-sm">
                <div className="pb-5 border-b border-[#f3f5fb] flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#004ac6] uppercase tracking-wider">Đang xem bộ đề</span>
                    <h2 className="text-xl font-extrabold text-[#111827] mt-0.5">{selectedCollection.name}</h2>
                    {selectedCollection.description && (
                      <p className="text-sm text-[#667085] mt-1">{selectedCollection.description}</p>
                    )}
                  </div>
                  <Link
                    to={`/teacher/tests/create?collectionId=${selectedCollection.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:text-[#003da3] bg-[#eaf0ff] hover:bg-[#004ac6]/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm đề vào bộ này
                  </Link>
                </div>

                {/* Tests List */}
                <div className="mt-6">
                  {loadingTests ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004ac6] mx-auto"></div>
                      <p className="text-sm text-[#667085] mt-4">Đang tải danh sách đề thi...</p>
                    </div>
                  ) : tests.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-[#e4e7ec] rounded-xl">
                      <FileText className="h-10 w-10 text-[#98a2b3] mx-auto mb-3" />
                      <h4 className="text-base font-bold text-[#111827]">Chưa có đề thi trong bộ này</h4>
                      <p className="text-sm text-[#667085] mt-1.5 max-w-sm mx-auto">
                        Hãy tạo đề thi TOEIC đầu tiên để nạp câu hỏi, file nghe, ảnh minh họa.
                      </p>
                      <Link
                        to={`/teacher/tests/create?collectionId=${selectedCollection.id}`}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003da3] transition-all shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tạo đề ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div
                          key={test.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-[#e4e7ec] hover:border-[#b0c4de] hover:shadow-md transition-all gap-4 bg-white"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="inline-flex items-center justify-center bg-[#f3f5fb] text-[#004ac6] text-xs font-bold px-2 py-0.5 rounded border border-[#e4e7ec]">
                                Đề #{test.test_number}
                              </span>
                              <h3 className="text-base font-extrabold text-[#111827]">{test.title}</h3>
                              {test.is_published ? (
                                <span className="inline-flex items-center gap-1 bg-[#ecfdf3] text-[#027a48] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#abedf6]/10">
                                  <CheckCircle className="h-3 w-3" />
                                  Đã xuất bản
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-[#fffaeb] text-[#b54708] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#fecdca]/20">
                                  <AlertCircle className="h-3 w-3" />
                                  Bản nháp
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#667085] line-clamp-1">{test.description || 'Không có mô tả'}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-[#667085] pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-[#98a2b3]" />
                                {test.duration_minutes} phút
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-[#98a2b3]" />
                                {test.total_questions} câu hỏi
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center">
                            <Link
                              to={`/teacher/tests/create?testId=${test.id}&collectionId=${selectedCollection?.id || test.collection_id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border border-[#d8dced] text-[#344054] hover:bg-[#f9fafb] transition-all bg-white"
                            >
                              Cấu hình & Sửa
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#d8dced] p-12 text-center shadow-sm">
                <FolderOpen className="h-12 w-12 text-[#98a2b3] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#111827]">Chọn một bộ đề thi</h3>
                <p className="text-sm text-[#667085] mt-2 max-w-sm mx-auto">
                  Hãy chọn một bộ sưu tập ở menu bên trái để quản lý danh sách đề thi, hoặc tạo mới một bộ sưu tập đề thi TOEIC.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003da3] transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Tạo bộ đề mới
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create Collection */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl border border-[#d8dced] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-5 border-b border-[#f3f5fb]">
                <h3 className="text-lg font-extrabold text-[#111827]">Tạo bộ sưu tập đề thi</h3>
                <p className="text-xs text-[#667085] mt-1">Phân loại các đề thi TOEIC (ví dụ: ETS 2023, Hacker TOEIC...)</p>
              </div>

              <form onSubmit={handleCreateCollection}>
                <div className="p-6 space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-xs font-semibold text-[#b42318] flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#344054]">Tên bộ đề <span className="text-[#b42318]">*</span></label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Ví dụ: ETS TOEIC 2023"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all bg-white"
                      disabled={creatingCollection}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#344054]">Mô tả bộ đề</label>
                    <textarea
                      value={newCollectionDesc}
                      onChange={(e) => setNewCollectionDesc(e.target.value)}
                      placeholder="Thông tin thêm về bộ đề thi này..."
                      rows={3}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all bg-white resize-none"
                      disabled={creatingCollection}
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#f3f5fb] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setErrorMsg('');
                    }}
                    className="px-4 py-2 text-sm font-semibold border border-[#d8dced] rounded-lg text-[#344054] bg-white hover:bg-[#f9fafb] transition-all"
                    disabled={creatingCollection}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#004ac6] text-white hover:bg-[#003da3] shadow-md transition-all flex items-center gap-1.5"
                    disabled={creatingCollection}
                  >
                    {creatingCollection ? 'Đang tạo...' : 'Tạo bộ đề'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
