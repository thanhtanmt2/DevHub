const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { Company, CandidateProfile } = require('../models');

// Hàm xử lý dọn rác
const cleanupOrphanFiles = async () => {
  try {
    console.log('\n[CRON] 🧹 Bắt đầu tiến trình dọn dẹp file rác...');

    // 1. DỌN DẸP ẢNH (Logo Doanh nghiệp, Avatar...)
    const imageDir = path.join(__dirname, '../../uploads/images');
    if (fs.existsSync(imageDir)) {
      const images = fs.readdirSync(imageDir);
      
      // Truy vấn Database để lấy danh sách tên file đang được SỬ DỤNG
      const companies = await Company.findAll({ attributes: ['logo_url'] });
      const usedImages = companies
        .filter(c => c.logo_url && c.logo_url.includes('/uploads/images/'))
        .map(c => path.basename(c.logo_url));
      
      let deletedImages = 0;
      images.forEach(file => {
        if (file.startsWith('.')) return; // Bỏ qua các file hệ thống (như .DS_Store)
        
        const filePath = path.join(imageDir, file);
        const stats = fs.statSync(filePath);
        
        // Tính tuổi thọ của file (từ lúc upload đến hiện tại)
        const ageInMs = Date.now() - stats.mtimeMs;
        
        // ĐIỀU KIỆN XÓA: File cũ hơn 1 giờ (60 phút) VÀ không có tên trong DB
        // (Lưu giữ 1 giờ để người dùng up ảnh mà chưa kịp bấm nút Lưu form thì không bị xóa nhầm)
        if (ageInMs > 60 * 60 * 1000 && !usedImages.includes(file)) {
          fs.unlinkSync(filePath);
          deletedImages++;
        }
      });
      console.log(`[CRON] 🗑️ Đã dọn dẹp thành công ${deletedImages} ảnh rác (Images).`);
    }

    // 2. DỌN DẸP FILE PDF (CV Ứng viên)
    const cvDir = path.join(__dirname, '../../uploads/cvs');
    if (fs.existsSync(cvDir)) {
      const cvs = fs.readdirSync(cvDir);
      
      const profiles = await CandidateProfile.findAll({ attributes: ['cv_url'] });
      const usedCvs = profiles
        .filter(p => p.cv_url && p.cv_url.includes('/uploads/cvs/'))
        .map(p => path.basename(p.cv_url));
      
      let deletedCvs = 0;
      cvs.forEach(file => {
        if (file.startsWith('.')) return;
        const filePath = path.join(cvDir, file);
        const stats = fs.statSync(filePath);
        const ageInMs = Date.now() - stats.mtimeMs;
        
        if (ageInMs > 60 * 60 * 1000 && !usedCvs.includes(file)) {
          fs.unlinkSync(filePath);
          deletedCvs++;
        }
      });
      console.log(`[CRON] 🗑️ Đã dọn dẹp thành công ${deletedCvs} tệp CV rác.`);
    }

    console.log('[CRON] ✨ Hoàn tất tiến trình dọn dẹp.\n');
  } catch (error) {
    console.error('[CRON] ❌ Lỗi khi dọn dẹp file rác:', error);
  }
};

// Khởi chạy lập lịch (Cron)
const startCronJobs = () => {
  // Cú pháp cron: 'Phút Giờ Ngày Tháng Thứ'
  // '0 2 * * *' = Chạy vào đúng 2:00 AM (sáng sớm) mỗi ngày.
  cron.schedule('0 2 * * *', cleanupOrphanFiles);
  console.log('[SYSTEM] 🕒 CronJobs dọn rác tự động đã được kích hoạt (Chạy lúc 2:00 sáng mỗi ngày).');
};

module.exports = { startCronJobs, cleanupOrphanFiles };
