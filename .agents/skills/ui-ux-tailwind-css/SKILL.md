---
name: ui-ux-tailwind-css
description: >-
  Use this skill when the user asks to design, style, or improve any UI/UX
  element in this React project using Tailwind CSS. Covers component styling,
  responsive layouts, dark mode, accessibility (a11y), design system tokens,
  animations, and UX best practices. Activate when working on layouts, forms,
  modals, navigation, buttons, color themes, or any visual/interactive element.
---

# UI/UX Design & Tailwind CSS Skill

This project uses **Tailwind CSS** for styling within a **React** frontend. All
UI must be responsive, accessible, and consistent with the project's design system.

---

## Setup & Configuration

```bash
# Install Tailwind CSS (if not already)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
        secondary: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  body {
    @apply bg-white text-gray-900 font-sans dark:bg-gray-950 dark:text-gray-100;
  }
}
```

---

## Design System Tokens

### Colors

| Token       | Light Mode Class     | Dark Mode Class         | Usage                |
|-------------|----------------------|-------------------------|----------------------|
| Primary     | `bg-primary-600`     | `dark:bg-primary-500`   | CTA buttons, links   |
| Surface     | `bg-white`           | `dark:bg-gray-900`      | Cards, panels        |
| Background  | `bg-gray-50`         | `dark:bg-gray-950`      | Page background      |
| Border      | `border-gray-200`    | `dark:border-gray-700`  | Dividers, inputs     |
| Text Base   | `text-gray-900`      | `dark:text-gray-100`    | Body text            |
| Text Muted  | `text-gray-500`      | `dark:text-gray-400`    | Captions, labels     |
| Error       | `text-red-600`       | `dark:text-red-400`     | Validation errors    |
| Success     | `text-green-600`     | `dark:text-green-400`   | Success states       |

### Spacing Scale

Use Tailwind's default scale:
- `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px
- `gap-4` for flex/grid gaps between cards
- `mb-6` between form sections

---

## Component Patterns

### Button

```jsx
// Primary Button
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg
  hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500
  focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200">
  Submit
</button>

// Secondary / Outline Button
<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500
  dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800
  transition-colors duration-200">
  Cancel
</button>
```

### Input Field

```jsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Email
  </label>
  <input
    type="email"
    className="px-3 py-2 border border-gray-300 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      dark:bg-gray-800 dark:border-gray-600 dark:text-white
      placeholder:text-gray-400 transition duration-200"
    placeholder="you@example.com"
  />
  {/* Error state */}
  <p className="text-xs text-red-600 dark:text-red-400">This field is required.</p>
</div>
```

### Card

```jsx
<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border
  border-gray-200 dark:border-gray-700 p-6 hover:shadow-md
  transition-shadow duration-200">
  {/* Content */}
</div>
```

### Modal / Dialog

```jsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40
  flex items-center justify-center">
  {/* Dialog */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full
    max-w-md mx-4 p-6 z-50">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Dialog Title
    </h2>
    {/* Content */}
    <div className="flex justify-end gap-3 mt-6">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

### Navbar

```jsx
<nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80
  backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <span className="text-xl font-bold text-primary-600">Logo</span>
      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6">
        <a className="text-sm text-gray-600 hover:text-primary-600
          dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
          Home
        </a>
      </div>
    </div>
  </div>
</nav>
```

---

## Responsive Layout

Always use mobile-first breakpoints:

| Prefix | Min-width | Device        |
|--------|-----------|---------------|
| (none) | 0px       | Mobile        |
| `sm:`  | 640px     | Large mobile  |
| `md:`  | 768px     | Tablet        |
| `lg:`  | 1024px    | Laptop        |
| `xl:`  | 1280px    | Desktop       |
| `2xl:` | 1536px    | Wide screen   |

```jsx
// Responsive grid example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

## Accessibility (a11y) Rules

1. **Interactive elements** must have `focus:ring-2` visible focus style
2. **Images** must have `alt` attributes
3. **Form inputs** must have `<label>` associated via `htmlFor`
4. **Icon-only buttons** must have `aria-label`
5. **Color alone** must not convey meaning – always add text or icon
6. **Contrast ratio** ≥ 4.5:1 for normal text (use Tailwind's pre-tested palette)
7. **Modals** must trap focus and close on `Escape` key
8. Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`

---

## Dark Mode Implementation

Toggle dark mode via a class on `<html>`:

```js
// utils/theme.js
export const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
};

export const initTheme = () => {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  }
};
```

Call `initTheme()` in `main.jsx` before React renders.

---

## Animation & Transitions

Use Tailwind's built-in utilities for micro-interactions:

```jsx
// Fade in
<div className="animate-fade-in opacity-0 animate-[fadeIn_0.3s_ease_forwards]" />

// Hover scale
<button className="hover:scale-105 active:scale-95 transition-transform duration-150">

// Spinner
<div className="w-5 h-5 border-2 border-primary-600 border-t-transparent
  rounded-full animate-spin" />
```

For complex animations, use `@keyframes` in `index.css` with `@layer utilities`.

---

## Form UX Best Practices

1. Show **inline validation** immediately after blur (not on submit)
2. **Disable submit button** while loading, show spinner
3. Use **placeholder text** only as hints, not labels
4. Group related fields visually
5. Provide **success feedback** (toast/snackbar) after submit

### Toast Notification Pattern

```jsx
// Minimal toast using state + Tailwind
const [toast, setToast] = useState(null);

// Show: setToast({ type: 'success', message: 'Saved!' })
// Auto-dismiss after 3s with useEffect

<div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white text-sm
  shadow-lg transition-all duration-300 z-50
  ${toast?.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
  {toast?.message}
</div>
```

---

## Verification Checklist

After any UI/UX work:

- [ ] Looks correct on **mobile (375px)**, tablet (768px), desktop (1280px)
- [ ] **Dark mode** renders correctly (no white flash, correct colors)
- [ ] All interactive elements have **visible focus ring**
- [ ] Form inputs have **associated labels**
- [ ] Loading states show **spinner or skeleton**
- [ ] Error states are **visible and descriptive**
- [ ] No hardcoded colors outside `tailwind.config.js` tokens
- [ ] Component is **extracted** if used more than once

---

## References

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/components)
- [Headless UI (accessible components)](https://headlessui.com/)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Checklist](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Primitives](https://www.radix-ui.com/)
