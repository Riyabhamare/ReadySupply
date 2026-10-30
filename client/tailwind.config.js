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
        background: {
          light: '#F7F8FA',
          dark: '#0B1120',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        border: {
          light: '#E5E7EB',
          dark: '#334155',
        },
        text: {
          light: '#0F172A',
          dark: '#F8FAFC',
        },
        muted: {
          light: '#64748B',
          dark: '#94A3B8',
        },
        navy: {
          DEFAULT: '#0B1F44',
          dark: '#061024',
          light: '#162C5B',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
          DEFAULT: '#2563EB',
        },
        success: {
          DEFAULT: '#16A34A',
          bg: '#DCFCE7',
          darkBg: '#064E3B',
          darkText: '#86EFAC',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          darkBg: '#78350F',
          darkText: '#FDE68A',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEE2E2',
          darkBg: '#7F1D1D',
          darkText: '#FCA5A5',
        },
        info: {
          DEFAULT: '#2563EB',
          bg: '#DBEAFE',
          darkBg: '#1E3A8A',
          darkText: '#93C5FD',
        },
        neutralStatus: {
          DEFAULT: '#64748B',
          bg: '#F1F5F9',
          darkBg: '#1E293B',
          darkText: '#CBD5E1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 23, 42, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}

