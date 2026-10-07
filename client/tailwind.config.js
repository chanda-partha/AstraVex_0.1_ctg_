/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#04060b', /* primary dark bg — used consistently everywhere */
          900: '#03050e',
          850: '#060913',
          800: '#0b0f19',
          700: '#151c2e',
          600: '#1f293d',
          500: '#2a3650',
        },
        mars: {
          red: '#ff4d4d',
          orange: '#ff8c42',
          glow: 'rgba(255, 77, 77, 0.3)',
        },
        lunar: {
          silver: '#e2e8f0',
          glow: 'rgba(226, 232, 240, 0.3)',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          cyan: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        orbitron: ['Orbitron', 'monospace', 'sans-serif'],
        display: ['Space Grotesk', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(56, 189, 248, 0.4)',
        'glow-mars': '0 0 25px rgba(255, 77, 77, 0.5)',
        'glow-moon': '0 0 25px rgba(226, 232, 240, 0.5)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.45)',
        'glow-emerald': '0 0 20px rgba(52, 211, 153, 0.5)',
        'glow-blue': '0 0 20px rgba(96, 165, 250, 0.4)',
        'nav-glow': '0 4px 30px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.05) inset',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)' },
          '50%': { boxShadow: '0 0 30px rgba(56, 189, 248, 0.55)' },
        },
      },
      backdropBlur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
