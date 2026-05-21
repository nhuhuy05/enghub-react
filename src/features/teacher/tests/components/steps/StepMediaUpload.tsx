import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileAudio,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  ExternalLink,
  Check
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { MediaAsset } from '../../types/teacherTestTypes';

interface StepMediaUploadProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepMediaUpload = ({
  testId,
  nextStep,
  prevStep,
}: StepMediaUploadProps) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaLabel, setMediaLabel] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'audio'>('image');
  const [isAudioMain, setIsAudioMain] = useState(false);

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMedia();
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, [testId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await teacherTestService.getTestMedia(testId);
      if (res.code === 1000) {
        setMediaAssets(res.result || []);
      }
    } catch (err) {
      console.warn('Lấy danh sách media thất bại (có thể endpoint chưa hỗ trợ), sử dụng state rỗng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Auto detect type based on file type
      if (file.type.startsWith('audio/')) {
        setMediaType('audio');
        setIsAudioMain(true);
        setMediaLabel('audio_main');
      } else if (file.type.startsWith('image/')) {
        setMediaType('image');
        setIsAudioMain(false);
        setMediaLabel('');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn một file');
      return;
    }

    const finalLabel = isAudioMain ? 'audio_main' : mediaLabel.trim();
    if (!finalLabel) {
      setErrorMsg('Vui lòng nhập label cho media');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const res = await teacherTestService.uploadMedia(
        testId,
        selectedFile,
        finalLabel,
        mediaType
      );

      if (res.code === 1000) {
        setMediaAssets((prev) => [...prev, res.result]);
        setSuccessMsg(`Tải lên thành công: ${selectedFile.name}`);
        // Reset form
        setSelectedFile(null);
        setMediaLabel('');
        setIsAudioMain(false);
      } else {
        setErrorMsg(res.message || 'Tải lên thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tải file lên Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await teacherTestService.deleteMedia(testId, assetId);
      if (res.code === 1000) {
        setMediaAssets((prev) => prev.filter((item) => item.id !== assetId));
        setSuccessMsg('Đã xóa tài nguyên thành công');
        if (playingAudioId === assetId) {
          handleAudioStop();
        }
      } else {
        setErrorMsg(res.message || 'Xóa thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi xóa tài nguyên');
    }
  };

  const handleAudioPlay = (asset: MediaAsset) => {
    if (playingAudioId === asset.id) {
      handleAudioStop();
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    audioPlayerRef.current = new Audio(asset.url);
    audioPlayerRef.current.play();
    setPlayingAudioId(asset.id);

    audioPlayerRef.current.onended = () => {
      setPlayingAudioId(null);
    };
  };

  const handleAudioStop = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setPlayingAudioId(null);
  };

  const images = mediaAssets.filter((item) => item.media_type === 'image');
  const audios = mediaAssets.filter((item) => item.media_type === 'audio');

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="lg:col-span-5 bg-[#f9fafb] p-6 rounded-2xl border border-[#e4e7ec] space-y-5">
          <h3 className="text-sm font-bold text-[#111827]">Tải lên tài nguyên mới</h3>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-[#d8dced] hover:border-[#004ac6] rounded-xl p-6 text-center cursor-pointer transition-all bg-white relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,audio/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-[#98a2b3] mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-[#004ac6] line-clamp-1">{selectedFile.name}</p>
                  <p className="text-xs text-[#667085] mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-[#344054]">Kéo thả hoặc Click để chọn file</p>
                  <p className="text-xs text-[#667085] mt-1">Hỗ trợ Ảnh (.png, .jpg, .jpeg) và Audio (.mp3, .wav)</p>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              {/* Type Switch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#344054]">Loại tài nguyên</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('image');
                      setIsAudioMain(false);
                      setMediaLabel('');
                    }}
                    className={`flex-1 p-2 text-center text-xs font-bold rounded-lg border transition-all ${
                      mediaType === 'image'
                        ? 'bg-[#eaf0ff] border-[#004ac6] text-[#004ac6]'
                        : 'bg-white border-[#d8dced] text-[#505f76]'
                    }`}
                  >
                    Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('audio');
                      setIsAudioMain(true);
                      setMediaLabel('audio_main');
                    }}
                    className={`flex-1 p-2 text-center text-xs font-bold rounded-lg border transition-all ${
                      mediaType === 'audio'
                        ? 'bg-[#eaf0ff] border-[#004ac6] text-[#004ac6]'
                        : 'bg-white border-[#d8dced] text-[#505f76]'
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>

              {/* Audio Main Switch */}
              {mediaType === 'audio' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="audio_main"
                    checked={isAudioMain}
                    onChange={(e) => {
                      setIsAudioMain(e.target.checked);
                      if (e.target.checked) setMediaLabel('audio_main');
                    }}
                    className="h-4 w-4 rounded border-[#d8dced] text-[#004ac6] focus:ring-[#004ac6]"
                  />
                  <label htmlFor="audio_main" className="text-xs font-semibold text-[#344054] cursor-pointer">
                    Đây là File nghe chính của đề thi (`audio_main`)
                  </label>
                </div>
              )}

              {/* Label Field */}
              {!isAudioMain && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344054]">
                    Nhãn (Label) <span className="text-[#b42318]">*</span>
                  </label>
                  <input
                    type="text"
                    value={mediaLabel}
                    onChange={(e) => setMediaLabel(e.target.value)}
                    placeholder={
                      mediaType === 'image'
                        ? 'Nhập group_order (Ví dụ: 1 cho ảnh câu 1-6)'
                        : 'Ví dụ: audio_part1'
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white"
                  />
                  <p className="text-[10px] text-[#667085] leading-relaxed">
                    {mediaType === 'image'
                      ? 'Lưu ý: Đối với ảnh Part 1, label phải khớp với câu hỏi (1, 2, 3... 6). Với Part 3/4/6/7, label là số thứ tự câu hỏi đầu tiên của group.'
                      : 'Lưu ý: File nghe chính cần đặt nhãn là audio_main.'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#004ac6] text-white text-sm font-bold shadow-md hover:bg-[#003da3] transition-all"
                disabled={uploading}
              >
                {uploading ? 'Đang tải lên Cloudinary...' : 'Tải lên tài nguyên'}
              </button>
            </div>
          )}
        </form>

        {/* Assets List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audios */}
          <div className="bg-white p-5 rounded-2xl border border-[#d8dced] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2 border-b border-[#f3f5fb] pb-3 mb-4">
              <FileAudio className="h-4.5 w-4.5 text-[#004ac6]" />
              File Âm thanh ({audios.length})
            </h3>
            
            {audios.length === 0 ? (
              <p className="text-xs text-[#667085] text-center py-6">Chưa có file âm thanh nào được tải lên.</p>
            ) : (
              <div className="space-y-3">
                {audios.map((audio) => (
                  <div
                    key={audio.id}
                    className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl bg-white"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => handleAudioPlay(audio)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                          playingAudioId === audio.id ? 'bg-[#d92d20]' : 'bg-[#004ac6]'
                        }`}
                      >
                        {playingAudioId === audio.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-[#111827] block truncate">{audio.original_filename}</span>
                        <span className="text-[10px] text-[#505f76] block">
                          Nhãn: <strong className="text-[#004ac6]">{audio.label}</strong>
                          {audio.duration_ms && ` • ${(audio.duration_ms / 1000 / 60).toFixed(2)} phút`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(audio.id)}
                      className="p-1.5 rounded-lg border border-[#fecdca] text-[#d92d20] hover:bg-[#fef3f2] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white p-5 rounded-2xl border border-[#d8dced] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2 border-b border-[#f3f5fb] pb-3 mb-4">
              <ImageIcon className="h-4.5 w-4.5 text-[#004ac6]" />
              Hình ảnh / Đồ họa ({images.length})
            </h3>

            {images.length === 0 ? (
              <p className="text-xs text-[#667085] text-center py-6">Chưa có hình ảnh nào được tải lên.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="border border-[#e4e7ec] rounded-xl overflow-hidden group relative hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-[#f9fafb] relative overflow-hidden flex items-center justify-center">
                      <img src={img.url} alt={img.label} className="max-h-full max-w-full object-contain" />
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-[#111827]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="p-2.5 bg-[#f9fafb] border-t border-[#e4e7ec] flex items-center justify-between">
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-[#667085] block truncate">Nhãn (group):</span>
                        <span className="text-xs font-bold text-[#111827] block truncate">{img.label}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-1 rounded text-[#d92d20] hover:bg-[#fef3f2] shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-[#f3f5fb] flex items-center justify-between">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#003da3] transition-all"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
