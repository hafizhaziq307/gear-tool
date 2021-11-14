const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        gray: colors.gray,
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
