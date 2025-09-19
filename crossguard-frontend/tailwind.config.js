/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'vintage': ['Georgia', 'serif'],
      },
      colors: {
        'vintage': {
          'black': '#000000',
          'white': '#ffffff',
          'gray': '#f5f5f5',
          'dark-gray': '#333333',
        }
      }
    },
  },
  plugins: [],
}