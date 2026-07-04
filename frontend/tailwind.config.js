/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        brand: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      colors: {
        artisan: {
          bg: "#0a0b10",
          card: "#13141f",
          border: "#232538",
          hover: "#1a1c2e",
          amber: "#f59e0b",
          copper: "#d97706",
          rose: "#f43f5e",
          violet: "#8b5cf6",
          emerald: "#10b981",
          light: "#f8fafc"
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.99)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px -3px rgba(245, 158, 11, 0.15)' },
          '100%': { boxShadow: '0 0 25px 2px rgba(244, 63, 94, 0.25)' },
        }
      }
    },
  },
  plugins: [],
}
