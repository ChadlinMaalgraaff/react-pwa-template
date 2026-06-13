/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        secondary: '#2563EB',
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: '#DC2626',
        surface: '#FFFFFF',
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
