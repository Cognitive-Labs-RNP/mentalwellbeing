/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0f1e',
          secondary: '#0d1117',
          tertiary: '#111827',
        },
        surface: {
          DEFAULT: '#1a2035',
          hover: '#232b47',
          border: 'rgba(167, 139, 250, 0.12)',
        },
        accent: {
          lavender: '#a78bfa',
          cyan: '#67e8f9',
          warm: '#f0f4ff',
          green: '#4ade80',
          rose: '#f87171',
          amber: '#fbbf24',
        },
        text: {
          primary: '#f0f4ff',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(10, 15, 30, 0.4)',
        glow: '0 0 40px rgba(167, 139, 250, 0.15)',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(ellipse at var(--x, 50%) var(--y, 0%), rgba(167,139,250,0.15), transparent 60%), radial-gradient(ellipse at var(--x2, 80%) var(--y2, 100%), rgba(103,232,249,0.1), transparent 55%)',
      },
      animation: {
        'blob-slow': 'blob 18s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
