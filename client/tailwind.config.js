/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ivory & Linen Canvas & Surfaces
        canvas: '#FAF8F5',
        canvasSubtle: '#F3EFEA',
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          cardGlass: 'rgba(255, 255, 255, 0.85)',
          muted: '#F5F2EC',
          border: '#E7E2D9',
          borderHover: '#0D9488',
        },
        // Deep Editorial Teal Hierarchy
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488', // Primary Teal Accent
          700: '#0F766E', // Deep Teal Accent
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E', // Deep Forest Teal
        },
        // Status Badges (Strict Zero-Purple Palette)
        status: {
          verified: '#0D9488',
          verifiedBg: '#F0FDFA',
          verifiedBorder: '#99F6E4',
          disputed: '#D97706',
          disputedBg: '#FFFBEB',
          disputedBorder: '#FDE68A',
          context: '#0284C7',
          contextBg: '#F0F9FF',
          contextBorder: '#BAE6FD',
          unverified: '#64748B'
        },
        // High-contrast Editorial Charcoal & Slate Text Hierarchy
        textPrimary: '#111827',
        textSecondary: '#475569',
        textMuted: '#64748B',
        textSubtle: '#94A3B8',
        borderDefault: '#E5DFD5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif']
      },
      boxShadow: {
        'card-soft': '0 2px 12px -2px rgba(17, 24, 39, 0.05), 0 1px 3px rgba(17, 24, 39, 0.02)',
        'card-hover': '0 12px 28px -6px rgba(13, 148, 136, 0.12), 0 4px 10px -2px rgba(17, 24, 39, 0.04)',
        'teal-glow': '0 0 20px -3px rgba(13, 148, 136, 0.25)',
        'dropdown': '0 10px 30px -5px rgba(17, 24, 39, 0.1), 0 0 1px 1px rgba(231, 226, 217, 0.6)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.95)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
