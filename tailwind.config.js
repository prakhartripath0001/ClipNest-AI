/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        dark: '#0f172a',
        light: '#f1f5f9',
      },
      boxShadow: {
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
