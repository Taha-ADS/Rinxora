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
        // Titanium: neutral blacks and greys, like the iPhone's finish
        titanium: {
          950: '#000000',
          900: '#0B0B0F',
          850: '#111115',
          800: '#18181D',
          700: '#26262D',
          600: '#3A3A43',
          500: '#85858F',
          400: '#9E9EA9',
          300: '#BDBDC7',
          200: '#DBDBE2',
          100: '#EEEEF2',
          50: '#F8F8FA',
        },
        // Primary accent: the orb's warm pink (the key name is historical)
        amber: {
          200: '#FFD6E6',
          300: '#FF9CC4',
          400: '#FF5FA2',
          500: '#E0247A',
          600: '#B8185F',
        },
        // Secondary: platinum silver
        emerald: {
          300: '#E3E5EE',
          400: '#C9CBD9',
          500: '#A7AABD',
          600: '#8489A0',
        },
        // Alerts / end-call: burgundy
        rose: {
          300: '#F0A8BC',
          400: '#D9607F',
          500: '#B42A55',
          600: '#8E1A40',
        },
        champagne: {
          400: '#E3E5EE',
          500: '#C9CBD9',
          600: '#A7AABD',
          accent: '#C9CBD9',
          subtle: 'rgba(183, 148, 246, 0.16)',
        },
        burgundy: {
          400: '#B8325F',
          500: '#8E1A40',
          600: '#6B1231',
          700: '#4A0C22',
          900: '#26060F',
        },
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-subtle': '0 0 30px -5px rgba(183, 148, 246, 0.12)',
        'glow-emerald': '0 0 25px -5px rgba(201, 203, 217, 0.22)',
        'glow-fuchsia': '0 0 25px -5px rgba(155, 108, 240, 0.3)',
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
