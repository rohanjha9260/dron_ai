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
        dark: {
          950: '#04070c',
          900: '#070c14',
          850: '#0c1320',
          800: '#111b2c',
          750: '#17243a',
          700: '#1e2f4a',
        },
        // Re-map indigo and cyan to Deep Teal & Coral Peach
        indigo: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        cyan: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          glow: 'rgba(45, 212, 191, 0.45)',
        },
        coral: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#ff6b6b',
          glow: 'rgba(251, 113, 133, 0.45)',
        },
        brand: {
          primary: '#2dd4bf',
          primaryLight: '#5eead4',
          primaryDark: '#0d9488',
          teal: '#2dd4bf',
          coral: '#fb7185',
          peach: '#fda4af',
          rose: '#f43f5e',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 28px rgba(45, 212, 191, 0.45)',
        'glow-teal': '0 0 35px rgba(45, 212, 191, 0.5)',
        'glow-coral': '0 0 30px rgba(251, 113, 133, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.7)',
        'glass-card': '0 20px 40px -15px rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 7s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
      }
    },
  },
  plugins: [],
}
