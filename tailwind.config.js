const { transform } = require('typescript');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html, ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A1B9A',
        success: '#1b5e20',
      },
      fontFamily:{
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'salar': "url('https://images.unsplash.com/photo-1586016413667-73d981a1c7e1?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')",
        'titicaca': "url('https://images.unsplash.com/photo-1590524731199-8c5f7b6735e1?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')",
        'valle-luna': "url('https://images.unsplash.com/photo-1622372738946-62e02505feb3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')",
      },
      animation: {
        'slide-in-left': 'slideInLeft 0.5s ease-in-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-in-out forwards',
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}

