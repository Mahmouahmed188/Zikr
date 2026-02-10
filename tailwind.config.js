/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#C5A059', // Gold
            light: '#F0D48E', // Light Gold
            dark: '#8E733D', // Dark Gold
          },
          dark: {
            bg: '#0F111A', // Deep Dark Blue/Black
            card: '#1A1D29', // Slightly lighter dark
            border: '#ffffff10', // White with 10% opacity
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          serif: ['Amiri', 'serif'], // Arabic font
          amiri: ['Amiri', 'serif'],
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'gold-glow': '0 0 15px rgba(197, 160, 89, 0.5)',
        },
        backgroundImage: {
          'gold-gradient': 'linear-gradient(to right, #C5A059, #F0D48E)',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          }
        }
      },
    },
    plugins: [],
}
  
