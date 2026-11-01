import jsQR from 'jsqr';

export const VIETQR_BANKS = [
  { code: 'VCB', bin: '970436', shortName: 'Vietcombank (VCB)', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', keywords: ['vietcombank', 'vcb', 'ngoai thuong'] },
  { code: 'TCB', bin: '970407', shortName: 'Techcombank (TCB)', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', keywords: ['techcombank', 'tcb', 'ky thuong'] },
  { code: 'MB', bin: '970422', shortName: 'MBBank (MB)', name: 'Ngân hàng TMCP Quân đội', keywords: ['mbbank', 'mb', 'quan doi'] },
  { code: 'ACB', bin: '970416', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu', keywords: ['acb', 'a chau'] },
  { code: 'VPB', bin: '970432', shortName: 'VPBank (VPB)', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', keywords: ['vpbank', 'vpb', 'thinh vuong'] },
  { code: 'BIDV', bin: '970418', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', keywords: ['bidv', 'dau tu'] },
  { code: 'ICB', bin: '970415', shortName: 'VietinBank (CTG)', name: 'Ngân hàng TMCP Công thương Việt Nam', keywords: ['vietinbank', 'icb', 'ctg', 'cong thuong'] },
  { code: 'VBA', bin: '970405', shortName: 'Agribank (VBA)', name: 'Ngân hàng NN&PT Nông thôn Việt Nam', keywords: ['agribank', 'vba', 'nong nghiep'] },
  { code: 'STB', bin: '970403', shortName: 'Sacombank (STB)', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', keywords: ['sacombank', 'stb', 'sai gon thuong tin'] },
  { code: 'TPB', bin: '970423', shortName: 'TPBank (TPB)', name: 'Ngân hàng TMCP Tiên Phong', keywords: ['tpbank', 'tpb', 'tien phong'] },
  { code: 'VIB', bin: '970441', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', keywords: ['vib', 'quoc te'] },
  { code: 'HDB', bin: '970437', shortName: 'HDBank (HDB)', name: 'Ngân hàng TMCP Phát triển TP.HCM', keywords: ['hdbank', 'hdb'] },
  { code: 'MSB', bin: '970426', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', keywords: ['msb', 'hang hai', 'maritime'] },
  { code: 'OCB', bin: '970448', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông', keywords: ['ocb', 'phuong dong'] },
  { code: 'SHB', bin: '970443', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', keywords: ['shb', 'sai gon ha noi'] },
  { code: 'EIB', bin: '970431', shortName: 'Eximbank (EIB)', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', keywords: ['eximbank', 'eib'] },
  { code: 'LPB', bin: '970449', shortName: 'LPBank (LPB)', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', keywords: ['lpbank', 'lpb', 'lienviet', 'loc phat'] },
  { code: 'SEAB', bin: '970440', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á', keywords: ['seabank', 'seab', 'dong nam a'] },
  { code: 'CAKE', bin: '546034', shortName: 'CAKE by VPBank', name: 'Ngân hàng số CAKE by VPBank', keywords: ['cake'] },
  { code: 'UBANK', bin: '546035', shortName: 'Ubank by VPBank', name: 'Ngân hàng số Ubank by VPBank', keywords: ['ubank'] },
  { code: 'TIMO', bin: '963388', shortName: 'Timo by Ban Viet', name: 'Ngân hàng số Timo', keywords: ['timo'] },
  { code: 'VCCB', bin: '970454', shortName: 'BVBank (Bản Việt)', name: 'Ngân hàng TMCP Bản Việt', keywords: ['bvbank', 'ban viet', 'vccb', 'vietcapital'] },
  { code: 'NAB', bin: '970428', shortName: 'Nam A Bank (NAB)', name: 'Ngân hàng TMCP Nam Á', keywords: ['nam a', 'nab', 'namabank'] },
  { code: 'BAB', bin: '970409', shortName: 'Bac A Bank (BAB)', name: 'Ngân hàng TMCP Bắc Á', keywords: ['bac a', 'bab', 'bacabank'] },
  { code: 'VAB', bin: '970427', shortName: 'VietABank (VAB)', name: 'Ngân hàng TMCP Việt Á', keywords: ['viet a', 'vab', 'vietabank'] },
  { code: 'ABB', bin: '970425', shortName: 'ABBank (ABB)', name: 'Ngân hàng TMCP An Bình', keywords: ['abbank', 'abb', 'an binh'] },
  { code: 'NCB', bin: '970419', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân', keywords: ['ncb', 'quoc dan'] },
  { code: 'VIETBANK', bin: '970433', shortName: 'VietBank', name: 'Ngân hàng TMCP Việt Nam Thương Tín', keywords: ['vietbank', 'thuong tin'] },
  { code: 'KLB', bin: '970452', shortName: 'KienLongBank (KLB)', name: 'Ngân hàng TMCP Kiên Long', keywords: ['kienlong', 'klb', 'kien long'] },
  { code: 'SGB', bin: '970400', shortName: 'SaigonBank (SGB)', name: 'Ngân hàng TMCP Sài Gòn Công Thương', keywords: ['saigonbank', 'sgb'] },
  { code: 'PVCB', bin: '970412', shortName: 'PVcomBank', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', keywords: ['pvcombank', 'pvcb', 'dai chung'] },
  { code: 'SHBVN', bin: '970424', shortName: 'Shinhan Bank', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', keywords: ['shinhan', 'shbvn'] },
  { code: 'WVN', bin: '970457', shortName: 'Woori Bank', name: 'Ngân hàng TNHH MTV Woori Việt Nam', keywords: ['woori', 'wvn'] },
];

export function stripAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function resolveVietQrBank(bankNameOrBin) {
  if (!bankNameOrBin) return null;
  const norm = stripAccents(bankNameOrBin).toLowerCase().trim();
  if (!norm) return null;

  return (
    VIETQR_BANKS.find(
      (b) =>
        b.code.toLowerCase() === norm ||
        b.bin === norm ||
        stripAccents(b.shortName).toLowerCase() === norm ||
        b.keywords.some((kw) => norm.includes(kw))
    ) || null
  );
}

export function buildTransferContent(payment) {
  const shortId = String(payment?.id || '').slice(0, 6).toUpperCase();
  const rawName = payment?.WorkspaceMember?.CandidateProfile?.User?.full_name || '';
  const cleanName = stripAccents(rawName)
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
  return `DEVHUB TT ${cleanName} ${shortId}`.trim().slice(0, 50);
}

export function buildVietQrUrl({ bankName, accountNumber, accountHolderName, amount, description }) {
  const bank = resolveVietQrBank(bankName);
  const cleanAcc = String(accountNumber || '').replace(/\s+/g, '');
  if (!bank || !cleanAcc) return null;

  const params = new URLSearchParams();
  const numAmount = Math.round(Number(amount) || 0);
  if (numAmount > 0) params.set('amount', String(numAmount));
  if (description) params.set('addInfo', stripAccents(description).slice(0, 50));
  if (accountHolderName) params.set('accountName', stripAccents(accountHolderName).toUpperCase());

  return `https://img.vietqr.io/image/${bank.bin}-${cleanAcc}-compact2.png?${params.toString()}`;
}

// ── Giải mã chuỗi EMVCo VietQR (chuẩn NAPAS 247) ────────────────────────────
function parseEmvTlv(raw = '') {
  const map = new Map();
  let i = 0;
  const s = String(raw);
  while (i + 4 <= s.length) {
    const tag = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len) || len < 0 || i + 4 + len > s.length) break;
    const val = s.slice(i + 4, i + 4 + len);
    map.set(tag, val);
    i += 4 + len;
  }
  return map;
}

/**
 * Phân tích chuỗi QR theo chuẩn EMVCo của NAPAS (VietQR).
 * Trả về { bin, bank, accountNumber, accountHolderName, serviceCode, raw } hoặc null nếu không phải VietQR.
 */
export function parseVietQrPayload(rawQr = '') {
  const text = String(rawQr || '').trim();
  if (!text.startsWith('000201')) return null;

  const root = parseEmvTlv(text);
  // Tìm khối NAPAS (thường ở Tag 38, hoặc trong khoảng Tag 26..51)
  const candidateTags = ['38', ...Array.from({ length: 26 }, (_, idx) => String(26 + idx).padStart(2, '0'))];
  let napasBlock = null;

  for (const t of candidateTags) {
    const v = root.get(t);
    if (!v) continue;
    const sub = parseEmvTlv(v);
    const guid = (sub.get('00') || '').toUpperCase();
    if (guid === 'A000000727' && sub.get('01')) {
      napasBlock = sub;
      break;
    }
  }

  if (!napasBlock) return null;

  const beneficiary = parseEmvTlv(napasBlock.get('01') || '');
  const bin = (beneficiary.get('00') || '').trim();
  const accountNumber = (beneficiary.get('01') || '').trim();
  const serviceCode = (napasBlock.get('02') || '').trim();

  if (!bin || !accountNumber) return null;

  const bank = resolveVietQrBank(bin);

  // Một số ngân hàng đính kèm tên chủ TK ở Tag 59
  let accountHolderName = '';
  const rawName = (root.get('59') || '').trim();
  if (
    rawName &&
    !/^(n\/?a|null|undefined|merchant|vietqr)$/i.test(rawName) &&
    rawName.length >= 3
  ) {
    accountHolderName = stripAccents(rawName)
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  return {
    bin,
    bank,
    bankName: bank ? bank.shortName : `BIN ${bin}`,
    accountNumber,
    accountHolderName,
    serviceCode,
    raw: text,
  };
}

// ── Đọc mã QR từ file ảnh (hỗ trợ cả ảnh chụp màn hình điện thoại) ─────────
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc file ảnh'));
    };
    img.src = url;
  });
}

function scanCanvasWithJsQr(canvas, ctx, sx, sy, sw, sh, targetSize = 900, binarize = false) {
  const scale = Math.min(1, targetSize / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(ctx._sourceImage, sx, sy, sw, sh, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  if (binarize) {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = lum < 145 ? 0 : 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
    }
  }

  const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
  return code?.data || null;
}

/**
 * Giải mã ảnh QR ngân hàng do ứng viên tải lên.
 * Kết hợp BarcodeDetector (nếu trình duyệt hỗ trợ) + jsQR đa vùng / đa độ tương phản.
 */
export async function decodeVietQrFromImage(file) {
  const img = await loadImageFromFile(file);

  // 1. Thử BarcodeDetector gốc của trình duyệt trước (rất nhạy với ảnh chụp màn hình)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      for (const b of barcodes) {
        const parsed = parseVietQrPayload(b.rawValue);
        if (parsed) return parsed;
      }
    } catch {
      // Bỏ qua và chuyển sang jsQR
    }
  }

  // 2. Quét bằng jsQR với nhiều vùng cắt & mức tương phản (xử lý ảnh chụp màn hình dọc & mã QR màu)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx._sourceImage = img;

  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;

  const regions = [
    // Toàn ảnh độ phân giải cao & trung bình
    { sx: 0, sy: 0, sw: W, sh: H, size: 1200, binarize: false },
    { sx: 0, sy: 0, sw: W, sh: H, size: 800, binarize: false },
    { sx: 0, sy: 0, sw: W, sh: H, size: 1000, binarize: true },
    // Vùng trung tâm (ảnh chụp màn hình app ngân hàng thường đặt QR ở giữa)
    { sx: W * 0.05, sy: H * 0.15, sw: W * 0.9, sh: H * 0.7, size: 900, binarize: false },
    { sx: W * 0.05, sy: H * 0.15, sw: W * 0.9, sh: H * 0.7, size: 900, binarize: true },
    // Nửa trên & nửa dưới
    { sx: 0, sy: 0, sw: W, sh: H * 0.65, size: 900, binarize: false },
    { sx: 0, sy: H * 0.25, sw: W, sh: H * 0.7, size: 900, binarize: false },
  ];

  for (const r of regions) {
    const raw = scanCanvasWithJsQr(canvas, ctx, r.sx, r.sy, r.sw, r.sh, r.size, r.binarize);
    if (raw) {
      const parsed = parseVietQrPayload(raw);
      if (parsed) return parsed;
    }
  }

  throw new Error(
    'Không tìm thấy mã VietQR ngân hàng hợp lệ trong ảnh. Vui lòng chọn ảnh rõ nét chứa mã QR nhận tiền từ ứng dụng ngân hàng.'
  );
}
