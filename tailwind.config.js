/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        error: 'var(--color-error)',
        hover: 'var(--color-hover)',
        main : 'var(--color-main)',
        danger : 'var(--color-danger)',
        info : 'var(--color-info)',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}

