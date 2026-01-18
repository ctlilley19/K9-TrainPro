import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // K9 ProTrain Brand Colors - Red to match logo
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Surface colors (dark theme)
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0f1119',
        },
        // Badge tier colors
        tier: {
          bronze: '#cd7f32',
          silver: '#94a3b8',
          gold: '#f59e0b',
          platinum: '#22d3ee',
          diamond: '#c084fc',
        },
        // Activity colors
        activity: {
          kennel: '#6b7280',
          training: '#3b82f6',
          play: '#22c55e',
          potty: '#eab308',
          walk: '#f97316',
          feeding: '#8b5cf6',
          rest: '#38bdf8',
          grooming: '#ec4899',
          medical: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-brand': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color, rgba(239, 68, 68, 0.4))' },
          '50%': { boxShadow: '0 0 35px var(--glow-color, rgba(239, 68, 68, 0.6))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
