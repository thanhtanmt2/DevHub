/** @type {import('tailwindcss').Config} */

// Màu thương hiệu: xanh dương (600 = #376ee6 — màu của thanh trên cùng / footer / banner).
// Các sắc độ được khai báo thành biến CSS (kênh R G B) ở :root trong src/index.css để Tailwind ghép độ trong suốt
// (bg-primary-600/50...). Muốn đổi màu chủ đạo chỉ cần sửa các biến đó — trình duyệt tự cập nhật, không cần khởi động lại Vite.
// Chữ nhỏ trên nền trắng dùng 700 trở lên (đạt tương phản 4.5:1).
const brand = (shade) => `rgb(var(--primary-${shade}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: brand(50),
          100: brand(100),
          200: brand(200),
          300: brand(300),
          400: brand(400),
          500: brand(500),
          600: brand(600),
          700: brand(700),
          800: brand(800),
          900: brand(900),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
