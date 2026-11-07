/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf9f5',
          100: '#f5f4ef',
          200: '#e8e6df',
          300: '#d5d2c7',
          700: '#6b6a68',
          900: '#1f1e1d',
        }
      }
    },
  },
  plugins: [],
}

