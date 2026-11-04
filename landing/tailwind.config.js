/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        apple: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          ink: '#1D1D1F',
          muted: '#6E6E73',
          blue: '#0071E3',
          blueHover: '#0077ED',
          border: 'rgba(29, 29, 31, 0.08)',
        },
      },
    },
  },
  plugins: [],
};
