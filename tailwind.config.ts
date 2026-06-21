/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        fraunces: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E5C45',
          press:   '#16452F',
          soft:    '#3C7A60',
          light:   '#E7EFE8',
        },
        accent: {
          DEFAULT: '#CC8A1E',
          ink:     '#9A6510',
          light:   '#F7EBCF',
          tint:    '#F7EBCF',
        },
        danger:         '#C25A45',
        'danger-light': '#F6E5DF',
        surface:        '#FFFFFF',
        'surface-2':    '#FBF8F1',
        canvas:         '#F3F1EA',
        ink:            '#23211C',
        'ink-soft':     '#6B6458',
        'ink-mute':     '#9C9486',
        line:           '#EAE4D8',
        'line-strong':  '#DCD5C6',
        // neutral mapped to design tokens for back-compat with existing class refs
        neutral: {
          50:  '#F3F1EA',
          100: '#FBF8F1',
          200: '#EAE4D8',
          300: '#DCD5C6',
          400: '#9C9486',
          500: '#6B6458',
          600: '#6B6458',
          700: '#23211C',
          800: '#23211C',
          900: '#23211C',
        },
      },
      borderRadius: {
        card:  '22px',
        sheet: '30px',
      },
      boxShadow: {
        sm:  '0 1px 2px rgba(35,33,28,.05)',
        md:  '0 10px 28px rgba(35,33,28,.07)',
        nav: '0 8px 26px rgba(35,33,28,.13)',
        pop: '0 -12px 44px rgba(20,18,14,.18)',
        fab: '0 12px 26px -8px rgba(30,92,69,.6)',
        btn: '0 8px 18px -6px rgba(30,92,69,.5)',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
