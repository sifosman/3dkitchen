/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hds-primary': '#1a365d',
        'hds-secondary': '#2c5282',
      }
    },
  },
  plugins: [],
}
