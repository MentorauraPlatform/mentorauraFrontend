import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FFF7ED',
        },
        secondary: {
          DEFAULT: '#172033',
          hover: '#0F172A',
        },
        surface: '#FFFFFF',
        page: '#FFFCF9',
        muted: '#64748B',
        subtle: '#94A3B8',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(23, 32, 51, 0.05)',
        md: '0 4px 6px -1px rgba(23, 32, 51, 0.08), 0 2px 4px -2px rgba(23, 32, 51, 0.04)',
        lg: '0 10px 15px -3px rgba(23, 32, 51, 0.1), 0 4px 6px -4px rgba(23, 32, 51, 0.05)',
        xl: '0 20px 25px -5px rgba(23, 32, 51, 0.1), 0 8px 10px -6px rgba(23, 32, 51, 0.04)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
