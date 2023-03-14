// tailwind.config.js
module.exports = {
  mode: 'jit', // enable the JIT (just-in-time) compiler for faster development builds
  darkMode: 'class', // enable dark mode support
  content: [
    './pages/**/*.{js,ts,jsx,tsx}', // process all files in the pages directory and its subdirectories
    './components/**/*.{js,ts,jsx,tsx}', // process all files in the components directory and its subdirectories
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FCD34D', // define a custom primary color
        secondary: '#A5D5D5', // define a custom secondary color
        gradient: 'linear-gradient(to right, #000000, #434343)', // add the gradient color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // set the default font family to Inter
      },
      backgroundColor: {
        'primary': 'var(--color-primary)', // define a custom primary background color
      },
      textColor: {
        'primary': 'var(--color-primary-text)', // define a custom primary text color
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // enable typography features
    require('@tailwindcss/forms'), // enable form styles
    require('@tailwindcss/aspect-ratio'), // enable aspect ratio utilities
    // add any additional plugins here
  ],
};
