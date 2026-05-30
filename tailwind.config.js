/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'fc-bg':          '#141523',
        'fc-green':       '#00da6b',
        'fc-green-alt':   '#00d676',
        'fc-green-shadow':'#00984c',
        'fc-card':        '#33334d',
        'fc-text-muted':  '#a9a9ca',
        'fc-text-light':  '#cbcbde',
        'fc-border-gray': '#525268',
        'fc-text-cta':    '#141524',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

