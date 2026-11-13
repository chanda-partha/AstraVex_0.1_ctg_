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
          950: '#07090F',
          900: '#07090F',
          850: '#0B0F19',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        mars: {
          rust: '#D9774B',
          terracotta: '#B85630',
        },
        lunar: {
          steel: '#9DB4D3',
          silver: '#CBD5E1',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          cyan: '#7ba4d9',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        orbitron: ['Orbitron', 'monospace', 'sans-serif'],
        display: ['Space Grotesk', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 12px 32px -4px rgba(0, 0, 0, 0.55)',
        'modal': '0 24px 64px -8px rgba(0, 0, 0, 0.75)',
        'header': '0 4px 24px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.2s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.2s ease-out forwards',
        'slide-in-right': 'slideInRight 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.18s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
