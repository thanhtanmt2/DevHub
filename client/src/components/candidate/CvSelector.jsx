import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '@/api/uploadApi';
import { candidateApi } from '@/api/candidateApi';
import toast from 'react-hot-toast';

export default function CvSelector({ profile, value, onChange }) {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: cvsRes, isLoading: loadingCvs } = useQuery({
    queryKey: ['candidate-cvs'],
    queryFn: () => candidateApi.getMyCvs(),
  });

  const cvList = cvsRes?.data?.data || [];

  const [mode, setMode] = useState('existing'); // 'existing' or 'upload'
  const [selectedCvId, setSelectedCvId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [newCvTitle, setNewCvTitle] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [makeDefault, setMakeDefault] = useState(false);

  // Auto-select default or first CV when list loads
  useEffect(() => {
    if (cvList.length > 0 && mode === 'existing') {
      const defaultCv = cvList.find((c) => c.is_default) || cvList[0];
      if (!selectedCvId || !cvList.some((c) => c.id === selectedCvId)) {
        setSelectedCvId(defaultCv.id);
        onChange(defaultCv.file_url, defaultCv.name || defaultCv.file_name);
      }
    } else if (cvList.length === 0 && !loadingCvs && mode === 'existing' && !profile?.cv_url) {
      setMode('upload');
    }
  }, [cvList, loadingCvs]);

  const handleSelectExistingCv = (cv) => {
    setSelectedCvId(cv.id);
    onChange(cv.file_url, cv.name || cv.file_name);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'existing') {
      const chosen = cvList.find((c) => c.id === selectedCvId) || cvList[0];
      if (chosen) {
        setSelectedCvId(chosen.id);
        onChange(chosen.file_url, chosen.name || chosen.file_name);
      } else {
        onChange('', '');
      }
    } else {
      if (uploadedFile) {
        onChange(uploadedFile.url, uploadedFile.name);
      } else {
        onChange('', '');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file tối đa là 10MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadApi.uploadCV(file);
      const { url, filename } = res.data.data;

      const titleToUse = newCvTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
      setUploadedFile({ url, filename, name: titleToUse });
      onChange(url, titleToUse);
      toast.success(`Đã tải lên: ${filename}`);

      // If user wants to save this CV to profile list
      if (saveToProfile) {
        await candidateApi.addCv({
          name: titleToUse,
          file_url: url,
          file_name: filename,
          file_size: file.size,
          is_default: makeDefault,
        });
        qc.invalidateQueries(['candidate-cvs']);
        qc.invalidateQueries(['candidate-profile']);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tải lên CV thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800">
          Chọn CV để ứng tuyển <span className="text-red-500">*</span>
        </label>
        {cvList.length > 0 && (
          <span className="text-xs text-gray-500">
            Có <strong>{cvList.length}</strong> CV trong hồ sơ
          </span>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleSwitchMode('existing')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            mode === 'existing'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📂 Chọn từ hồ sơ ({cvList.length})
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('upload')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            mode === 'upload'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Tải lên CV mới
        </button>
      </div>

      {/* Content Mode 1: Chọn từ danh sách CV đã lưu */}
      {mode === 'existing' && (
        <div className="space-y-2 mt-2">
          {loadingCvs ? (
            <div className="text-center py-6 text-xs text-gray-400">Đang tải danh sách CV...</div>
          ) : cvList.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-xs text-amber-800 font-medium">
                Bạn chưa lưu bản CV nào trong hồ sơ.
              </p>
              <button
                type="button"
                onClick={() => handleSwitchMode('upload')}
                className="btn-primary text-xs py-1.5 px-3 mt-2 inline-flex items-center gap-1"
              >
                📤 Tải lên CV ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cvList.map((cv) => {
                const isSelected = selectedCvId === cv.id;
                return (
                  <label
                    key={cv.id}
                    onClick={() => handleSelectExistingCv(cv)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/30 ring-1 ring-primary-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="radio"
                        name="selected_cv_radio"
                        checked={isSelected}
                        onChange={() => handleSelectExistingCv(cv)}
                        className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                            {cv.name}
                          </span>
                          {cv.is_default && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          Tệp: {cv.file_name}
                        </p>
                      </div>
                    </div>

                    <a
                      href={cv.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-primary-700 hover:text-primary-800 font-medium bg-primary-100/70 hover:bg-primary-100 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1"
                    >
                      👁️ Xem file
                    </a>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Content Mode 2: Tải lên CV mới */}
      {mode === 'upload' && (
        <div className="space-y-3 mt-2 bg-gray-50/60 p-3.5 rounded-xl border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tên gọi cho CV (Tùy chọn)
            </label>
            <input
              type="text"
              className="input-field text-xs bg-white"
              placeholder="VD: CV Frontend React, CV Tiếng Anh..."
              value={newCvTitle}
              onChange={(e) => setNewCvTitle(e.target.value)}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-primary-500 bg-white p-4 rounded-xl text-center cursor-pointer transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-xs text-primary-600 font-medium">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang tải file lên...</span>
              </div>
            ) : uploadedFile ? (
              <div className="flex items-center justify-between gap-2 text-xs text-emerald-700">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base font-bold">✓</span>
                  <span className="font-semibold truncate">
                    {uploadedFile.name} ({uploadedFile.filename})
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={uploadedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[11px]"
                  >
                    👁️ Xem trước
                  </a>
                  <span className="text-gray-400 underline hover:text-primary-600">
                    Chọn file khác
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-2xl block mb-1">📤</span>
                <p className="text-xs font-medium text-gray-700">
                  Nhấp vào đây để chọn file CV từ máy tính
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Hỗ trợ định dạng PDF, DOC, DOCX (Tối đa 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              Lưu CV này vào danh sách hồ sơ để dùng cho các lần sau
            </label>

            {saveToProfile && (
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer ml-5">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                />
                Đồng thời đặt làm CV mặc định
              </label>
            )}
          </div>
        </div>
      )}

      {!value && (
        <p className="text-xs text-red-500">
          * Vui lòng chọn một bản CV hoặc tải lên file mới để nộp hồ sơ.
        </p>
      )}
    </div>
  );
}
