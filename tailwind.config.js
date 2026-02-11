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
          // Dark theme colors
          dark: {
            bg: '#0F111A', // Deep Dark Blue/Black
            card: '#1A1D29', // Slightly lighter dark
            border: '#ffffff10', // White with 10% opacity
            surface: '#252836',
          },
          // Light theme colors
          light: {
            bg: '#F8F9FC', // Soft white
            card: '#FFFFFF', // Pure white
            border: '#E5E7EB', // Light gray
            surface: '#F1F5F9', // Slightly darker white
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          serif: ['Scheherazade New', 'serif'], // Arabic font
          amiri: ['Scheherazade New', 'serif'],
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          'gold-glow': '0 0 15px rgba(197, 160, 89, 0.5)',
          'gold-glow-light': '0 0 15px rgba(197, 160, 89, 0.3)',
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
  
