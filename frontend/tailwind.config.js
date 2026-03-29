/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faecd5',
          200: '#f4d5a0',
          300: '#edb960',
          400: '#e69c35',
          500: '#d4831a',
          600: '#b86714',
          700: '#994f13',
          800: '#7c4016',
          900: '#663616',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
