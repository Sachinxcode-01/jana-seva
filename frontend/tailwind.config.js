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
        bytune: {
          bg0: '#050507',
          bg1: '#0a0a0e',
          surface: '#101016',
          panel: '#16161d',
          elev: '#1e1e27',
          textHi: '#f5f5f8',
          textMid: '#b6b6c2',
          textLow: '#8a8a97',
          textFaint: '#60606c',
          accent: '#8f8bff',
          accent2: '#6fd8ff',
          green: '#1ed760',
          gold: '#f3c64f',
          hairline: 'rgba(255, 255, 255, 0.08)',
          hairlineStrong: 'rgba(255, 255, 255, 0.16)',
          glass: 'rgba(255, 255, 255, 0.04)',
          glassStrong: 'rgba(255, 255, 255, 0.07)',
        },
        gov: {
          navy: '#f5f5f8',
          blue: '#8f8bff',
          sky: '#6fd8ff',
          green: '#1ed760',
          emerald: '#10b981',
          gold: '#f3c64f',
          amber: '#f3c64f',
          light: '#050507',
          surface: '#101016',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#f5f5f8',
          muted: '#b6b6c2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'SF Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        's': '0.625rem', // 10px
        'm': '1rem',    // 16px
        'l': '1.375rem',// 22px
        'card': '22px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 1.5rem 3.75rem -1.5rem rgba(0, 0, 0, 0.7)',
        'glass': 'rgba(255, 255, 255, 0.12) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.9) 0px 44px 90px -34px',
        'glow': '0 0 50px -10px rgba(143, 139, 255, 0.35)',
        'glow-cyan': '0 0 50px -10px rgba(111, 216, 255, 0.35)',
        'inset-hairline': 'rgba(255, 255, 255, 0.06) 0px 1px 0px 0px inset',
      },
      transitionTimingFunction: {
        'bytune-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bytune-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
      }
    },
  },
  plugins: [],
}
