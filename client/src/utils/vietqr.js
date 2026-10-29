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
];

export function stripAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function resolveVietQrBank(bankName) {
  if (!bankName) return null;
  const norm = stripAccents(bankName).toLowerCase().trim();
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
