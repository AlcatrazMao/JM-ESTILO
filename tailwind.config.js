/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0c0b0a',
        surface: '#141312',
        'surface-2': '#1c1a18',
        'surface-3': '#242220',
        border: '#252220',
        'border-b': '#353230',
        text: '#ede8e0',
        'text-dim': '#7a7470',
        'text-mid': '#aaa49c',
        gold: '#c9a84c',
        'gold-d': '#8a7030',
        'gold-b': '#e8c870',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}