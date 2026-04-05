/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec5b13',
          50:  '#fff4ee',
          100: '#ffe6d5',
          200: '#ffc9a9',
          300: '#ffa172',
          400: '#ff6e38',
          500: '#ec5b13',
          600: '#d44208',
          700: '#b03109',
          800: '#8c280e',
          900: '#72240f',
        },
        'form-primary': '#a33900',
        'form-primary-container': '#cc4900',
        'form-secondary': '#515f74',
        'form-background': '#f7f9fb',
        'form-on-surface': '#191c1e',
        'form-surface-lowest': '#ffffff',
        'form-surface-low': '#f2f4f6',
        'form-surface-highest': '#e0e3e5',
        'form-primary-fixed': '#ffdbce',
        'form-on-primary-fixed': '#7f2b00',
        'form-outline': '#e2bfb3',
        'form-error': '#ba1a1a',
        'form-error-container': '#ffdad6'
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', 'sans-serif'],
        headline: ['Public Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
