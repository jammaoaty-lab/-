/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-light': '#60A5FA',
        'primary-dark': '#2563EB',
        surface: '#FFFFFF',
        'surface-secondary': '#F8F9FB',
        'surface-tertiary': '#F1F3F5',
        'text-primary': '#1A1D23',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        border: '#E5E7EB',
        'border-light': '#F1F3F5',
        'user-bubble': '#EEF2FF',
        danger: '#EF4444',
        'danger-light': '#FEF2F2',
        success: '#10B981',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
