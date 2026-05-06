/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FFFFFF',
          card: '#F2F2F7',
          surface: '#E5E5EA',
          border: '#C6C6C8',
          text: '#1C1C1E',
          subtle: '#3A3A3C',
          muted: '#8E8E93',
        },
        brand: {
          bg: '#0A0A0A',
          surface: '#1C1C1E',
          card: '#2C2C2E',
          border: '#3A3A3C',
          primary: '#FF6B35',
          success: '#30D158',
          danger: '#FF453A',
          muted: '#636366',
          text: '#FFFFFF',
          subtle: '#AEAEB2',
        },
      },
    },
  },
  plugins: [],
};
