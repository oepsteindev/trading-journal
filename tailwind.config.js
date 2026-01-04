/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for the dashboard
        dashboard: {
          bg: {
            primary: '#0f172a',   // slate-950
            secondary: '#1e293b', // slate-900
            card: '#1e293b80',    // slate-800/50
          },
          border: {
            default: '#334155',   // slate-700
            light: '#475569',     // slate-600
          },
          text: {
            primary: '#f8fafc',   // white
            secondary: '#cbd5e1', // gray-300
            muted: '#94a3b8',     // gray-400
          },
          profit: {
            DEFAULT: '#10b981',   // emerald-500
            light: '#34d399',     // emerald-400
          },
          loss: {
            DEFAULT: '#f43f5e',   // rose-500
            light: '#fb7185',     // rose-400
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
