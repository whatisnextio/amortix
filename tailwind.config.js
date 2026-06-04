/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#06080f',
          card: '#0d1420',
          raised: '#14202e',
          border: 'rgba(255,255,255,0.06)',
        },
        accent: {
          DEFAULT: '#00d4aa',
          dim: '#00a882',
          subtle: 'rgba(0,212,170,0.1)',
        },
        danger: {
          DEFAULT: '#f43f5e',
          subtle: 'rgba(244,63,94,0.12)',
        },
        success: {
          DEFAULT: '#10b981',
          subtle: 'rgba(16,185,129,0.12)',
        },
        warn: {
          DEFAULT: '#f59e0b',
          subtle: 'rgba(245,158,11,0.12)',
        },
        ink: {
          primary: '#f0f4ff',
          secondary: '#8b9dc3',
          muted: '#4a5878',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        glow: '0 0 20px rgba(0,212,170,0.15)',
      },
    },
  },
  plugins: [],
}
