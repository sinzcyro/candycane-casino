/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0d',
        card: '#15171c',
        accent: '#00ff88',
        border: '#262931',
      },
    },
  },
  plugins: [],
}