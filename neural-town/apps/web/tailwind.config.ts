import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-deep': '#030614',
        'space-card': 'rgba(13, 17, 23, 0.8)',
        'nebulae-purple': '#6C5CE7',
        'ai-blue': '#00E5FF',
        'success-green': '#00F2A9',
        'warning-gold': '#FFD166',
        'danger-red': '#FF6B6B',
        'cosmic-border': 'rgba(108, 92, 231, 0.3)',
        'cosmic-border-hover': 'rgba(108, 92, 231, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
        'wormhole': 'wormhole 2s ease-out forwards',
        'big-bang': 'bigBang 0.6s ease-out forwards',
        'space-collapse': 'spaceCollapse 0.4s ease-in forwards',
        'star-burst': 'starBurst 0.5s ease-out forwards',
        'orbit': 'orbit 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(108, 92, 231, 0.3)' },
          '50%': { borderColor: 'rgba(108, 92, 231, 0.8)' },
        },
        wormhole: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        bigBang: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spaceCollapse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        starBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;