/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      Poppins: ["Poppins", "sans-serif"]
    },
    extend: {
      colors: {
        'lightBlue': '#0ea5e9', // sky-500
        'warmGray': '#78716c',  // stone-500
        'trueGray': '#737373',  // neutral-500
        'coolGray': '#6b7280',  // gray-500
        'blueGray': '#64748b',  // slate-500
      }
    },
  },
  plugins: [],
}