/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fcfbf7',
          100: '#f7f4ed',
          200: '#f0ebe0',
          300: '#e5dcce',
          400: '#cfbeaa',
          500: '#b8a186',
        },
        forest: {
          50: '#f1f8f3',
          100: '#deefe2',
          200: '#bfdec7',
          300: '#95c6a3',
          400: '#64a678',
          500: '#418b57',
          600: '#2f7043',
          700: '#265936',
          800: '#21472e',
          900: '#1c3b27',
          950: '#0b1f13',
        },
        earth: {
          500: '#8b6f47',
          600: '#735835',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(27, 46, 31, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'lifted': '0 10px 25px -5px rgba(27, 46, 31, 0.1), 0 8px 10px -6px rgba(27, 46, 31, 0.05)',
      }
    },
  },
  plugins: [],
}
