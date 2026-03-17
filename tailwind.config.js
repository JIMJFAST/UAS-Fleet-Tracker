/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#1f2937',
          850: '#111827',
        }
      }
    },
  },
  plugins: [],
}
