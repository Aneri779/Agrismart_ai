/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F0FAF3',
          100: '#DCF3E3',
          200: '#B7E6C4',
          400: '#4CAF63',
          500: '#2E8B4F',
          600: '#1F6B3B',
          700: '#164D2B',
          900: '#0B2A16',
        },
        ink: {
          900: '#14201A',
          600: '#55665C',
          300: '#A9B7AC',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F7FBF8',
          2: '#EEF6F0',
        },
        border: '#DFEBE2',
        success: '#2E8B4F',
        warning: '#E0A020',
        danger: '#D64545',
        info: '#2E7FD6',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(11,42,22,0.06)',
        'md': '0 4px 16px rgba(11,42,22,0.08)',
        'lg': '0 12px 32px rgba(11,42,22,0.12)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
