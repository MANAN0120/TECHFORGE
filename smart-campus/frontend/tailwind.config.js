/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A3E635',
        background: '#09090B',
        surface: '#18181B',
        surface2: '#27272A',
        foreground: '#FAFAFA',
        secondary: '#A1A1AA',
        border: '#3F3F46',
        route: '#A3E635',
        warning: '#FBBF24',
        error: '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
}
