/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#1a1714',
          800: '#242019',
          700: '#332d24',
          600: '#423a2e',
          500: '#5a5043',
          400: '#7a6f5e',
          300: '#9c9180',
          200: '#c4baa8',
          100: '#e2dccf',
          50: '#f5f1e8',
        },
        amber: {
          600: '#b45309',
          500: '#d97706',
          400: '#f59e0b',
          300: '#fcd34d',
        },
        green: {
          700: '#15803d',
          600: '#16a34a',
          500: '#22c55e',
          400: '#4ade80',
        },
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        pulseSubtle: 'pulseSubtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
