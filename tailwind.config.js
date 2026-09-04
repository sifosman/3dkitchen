/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hds-black': '#000000',
        'hds-gold': {
          DEFAULT: '#FFC400',
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC400',
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
        },
        'hds-dark': {
          50: '#1a1a1a',
          100: '#161616',
          200: '#121212',
          300: '#0e0e0e',
          400: '#0a0a0a',
          500: '#050505',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        'hds-border': {
          DEFAULT: '#2a2a2a',
          light: '#333333',
          medium: '#252525',
        }
      },
      fontFamily: {
        'heading': ['"Libre Franklin"', 'sans-serif'],
        'body': ['Jost', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(255, 196, 0, 0.15), 0 0 40px rgba(255, 196, 0, 0.05)',
        'gold-sm': '0 0 10px rgba(255, 196, 0, 0.12)',
        'gold-ring': '0 0 0 2px rgba(255, 196, 0, 0.5), 0 0 16px rgba(255, 196, 0, 0.15)',
        'elevated': '0 4px 30px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}