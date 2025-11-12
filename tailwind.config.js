/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    './blog/templates/**/*.html',
    './blog/**/*.py',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Libre Franklin"', 'sans-serif'],
        serif: ['Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      'lofi',  // Light theme
      'black', // Dark theme
    ],
    darkTheme: 'black',
    base: true,
    styled: true,
    utils: true,
  },
}
