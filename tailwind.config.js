/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hds-black': '#0a0a0a',
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
          50: '#2a2a2a',
          100: '#252525',
          200: '#202020',
          300: '#1a1a1a',
          400: '#161616',
          500: '#111111',
          600: '#0d0d0d',
          700: '#0a0a0a',
          800: '#070707',
          900: '#040404',
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