/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          green: '#EDF7EC',
          greenBorder: '#D2ECCB',
          greenText: '#2C6E26',
          blue: '#EBF5FB',
          blueBorder: '#AED6F1',
          blueText: '#1A5276',
          yellow: '#FEF9E7',
          yellowBorder: '#F9E79F',
          yellowText: '#7D6608',
          coral: '#FCE8EF',
          coralBorder: '#FADBD8',
          coralText: '#782845',
          peach: '#FFF4EE',
          peachBorder: '#FFD8C9',
          primary: '#E0533C',
          dark: '#1E1E1E'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
