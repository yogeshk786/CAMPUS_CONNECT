/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👉 THE FIX: Yeh line Tailwind ko batati hai ki class ke through dark mode switch karna hai
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}