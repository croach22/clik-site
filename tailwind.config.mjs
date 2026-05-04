/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Times New Roman', 'serif'],
        ui:      ['Aileron', 'Inter', 'system-ui', 'sans-serif'],
        sans:    ['Aileron', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
        lcd:     ['VT323', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        clik: {
          midnight: '#0E1834',
          cream:    '#F9F7F1',
          royce:    '#5481E8',
          salmon:   '#F9838E',
          bone:     '#E8E5DC',
          tally:    '#E24B4A',
        },
        // Legacy brand tokens — kept temporarily so unported pages (blog, concept, etc.) build.
        // Magenta is remapped to royce so any leftover usage renders as the new accent.
        brand: {
          coral:   '#F9838E',
          magenta: '#5481E8',
          blue:    '#5481E8',
          cream:   '#F9F7F1',
          bg:      '#0a080d',
          gold:    '#D4A853',
        },
      },
      letterSpacing: {
        mono:         '0.14em',
        'mono-tight': '0.08em',
        display:      '-0.02em',
      },
      borderRadius: {
        pill: '999px',
      },
      transitionTimingFunction: {
        'clik-out':  'cubic-bezier(0.2, 0.7, 0.2, 1)',
        'clik-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
