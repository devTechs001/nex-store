// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1f242d',
          secondary: '#323946',
          tertiary: '#2a3040',
        },
        text: {
          DEFAULT: '#fff',
          muted: '#a0a0a0',
          dim: '#6b7280',
        },
        main: {
          DEFAULT: '#0ef',
          dark: '#0bc',
          light: '#5ff5ff',
        },
        alt: '#1a2b3c',
        outline: '#0e1022',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': ['1.32rem', { lineHeight: '1.25' }],
        'sm': ['1.45rem', { lineHeight: '1.25' }],
        'base': ['1.6rem', { lineHeight: '1.5' }],
        'lg': ['1.92rem', { lineHeight: '1.5' }],
        'xl': ['2.4rem', { lineHeight: '1.375' }],
        '2xl': ['3.2rem', { lineHeight: '1.375' }],
        '3xl': ['4rem', { lineHeight: '1.25' }],
        '4xl': ['5.12rem', { lineHeight: '1.25' }],
        '5xl': ['6.4rem', { lineHeight: '1.25' }],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-left': 'slideLeft 0.3s ease-out forwards',
        'slide-right': 'slideRight 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--main-color)' },
          '50%': { boxShadow: '0 0 20px var(--main-color), 0 0 30px var(--main-color)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1800px',
      },
    },
  },
  plugins: [],
}