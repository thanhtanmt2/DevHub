import { useEffect, useState } from 'react';
import { useInView } from '@/components/home/Reveal';

// Số đếm tăng dần từ 0 tới `value` khi cuộn tới (tắt hiệu ứng nếu người dùng chọn giảm chuyển động)
export default function CountUp({ value = 0, duration = 1400, className = '' }) {
  const [ref, seen] = useInView(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(value); return undefined; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(value * (1 - (1 - p) ** 3))); // chậm dần về cuối
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, duration]);
  return <span ref={ref} className={className}>{new Intl.NumberFormat('vi-VN').format(n)}</span>;
}
