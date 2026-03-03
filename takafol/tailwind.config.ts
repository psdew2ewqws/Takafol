import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        takafol: {
          blue: '#7EC8E3',
          'blue-light': '#B8E2F2',
          'blue-pale': '#E8F4F8',
          'blue-deep': '#4A9BB5',
          'blue-darker': '#357A8F',
          white: '#FFFFFF',
          'off-white': '#F7FBFC',
          accent: '#2D9CDB',
          text: '#1A3A4A',
          'text-light': '#5A7D8A',
          'text-muted': '#8EAAB5',
          success: '#27AE60',
          'success-light': '#E8F8EF',
          warning: '#F2994A',
          'warning-light': '#FEF3E8',
          danger: '#EB5757',
          gold: '#F2C94C',
          'gold-light': '#FDF6E3',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Readex Pro"', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 58, 74, 0.04), 0 4px 12px rgba(126, 200, 227, 0.08)',
        'card-hover': '0 4px 20px rgba(126, 200, 227, 0.18), 0 1px 4px rgba(26, 58, 74, 0.06)',
        'nav': '0 -1px 12px rgba(126, 200, 227, 0.1)',
        'button': '0 2px 8px rgba(126, 200, 227, 0.3)',
        'button-hover': '0 4px 16px rgba(126, 200, 227, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(126, 200, 227, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(126, 200, 227, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
