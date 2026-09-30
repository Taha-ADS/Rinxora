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
        titanium: {
          950: '#07090D',
          900: '#0B0F17',
          850: '#101622',
          800: '#161E2E',
          700: '#222E42',
          600: '#344563',
          400: '#64748B',
          200: '#CBD5E1',
          100: '#E2E8F0',
          50: '#F8FAFC',
        },
        champagne: {
          400: '#FDE047',
          500: '#EAB308',
          600: '#CA8A04',
          accent: '#E6B758',
          subtle: 'rgba(230, 183, 88, 0.12)',
        },
        signal: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          blue: '#38BDF8',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-subtle': '0 0 30px -5px rgba(230, 183, 88, 0.08)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'tactile': '0 12px 30px -10px rgba(0, 0, 0, 0.8), 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
