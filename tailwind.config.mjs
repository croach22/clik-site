/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['PPFraktionMono', 'monospace'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          coral:   '#F9838E',
          magenta: '#DC1DD9',
          blue:    '#5481E8',
          cream:   '#F9F7F1',
          bg:      '#0a080d',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F9838E, #DC1DD9, #5481E8)',
      },
    },
  },
  plugins: [],
};
