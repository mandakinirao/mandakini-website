/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--color-cream)',
        parchment: 'var(--color-parchment)',
        toffee: 'var(--color-toffee)',
        salsa: 'var(--color-salsa)',
        amber: 'var(--color-amber)',
        cacao: 'var(--color-cacao)',
        'deep-cacao': 'var(--color-deep-cacao)',
        moss: 'var(--color-moss)',
        pumpkin: 'var(--color-pumpkin)',
        rosehip: 'var(--color-rosehip)',
        'near-black': 'var(--color-near-black)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        'display-sc': ['Cormorant SC', 'serif'],
        body: ['EB Garamond', 'serif'],
        ui: ['Jost', 'sans-serif'],
      },
      maxWidth: {
        container: '1320px',
        narrow: '860px',
      },
      spacing: {
        section: '7rem',
        'section-md': '4rem',
        'section-sm': '2.5rem',
      },
    },
  },
  plugins: [],
}
