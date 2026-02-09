/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-app': 'var(--bg-app)',
        'bg-card': 'var(--bg-card)',
        'bg-subtle': 'var(--bg-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'accent-primary': 'var(--accent-primary)',
        'accent-surface': 'var(--accent-surface)',
        'status-critical': 'var(--status-critical)',
        'status-warning': 'var(--status-warning)',
        'status-good': 'var(--status-good)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

