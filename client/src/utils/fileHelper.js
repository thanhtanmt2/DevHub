export const getFileViewUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
};

// Tên hiển thị của file đã upload: ưu tiên tên gốc trong ?name=, nếu không có thì lấy tên file trên server
export const getUploadedFileName = (url) => {
  if (!url) return '';
  const [path, query] = url.split('?');
  const name = new URLSearchParams(query || '').get('name');
  return name || decodeURIComponent(path.split('/').pop());
};

// Dung lượng file dễ đọc: 1.2 MB, 350 KB...
export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
