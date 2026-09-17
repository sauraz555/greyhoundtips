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
          950: '#0f0d0a',
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
          700: '#92400e',
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
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        run: {
          '0%': { transform: 'translateX(-10px) translateY(0)' },
          '25%': { transform: 'translateX(-5px) translateY(-3px)' },
          '50%': { transform: 'translateX(0) translateY(0)' },
          '75%': { transform: 'translateX(5px) translateY(-3px)' },
          '100%': { transform: 'translateX(10px) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(217,119,6,0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(217,119,6,0.35)' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        pulseSubtle: 'pulseSubtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        run: 'run 0.4s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        barGrow: 'barGrow 0.8s ease-out forwards',
        spinSlow: 'spinSlow 3s linear infinite',
        scaleIn: 'scaleIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
