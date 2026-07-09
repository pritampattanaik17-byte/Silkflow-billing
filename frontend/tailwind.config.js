/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '481px',
      'md': '769px',
      'lg': '1025px',
      'xl': '1441px',
    },
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: '#C89B3C',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        heading: 'rgb(var(--color-heading) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'card': '10px',
        'button': '8px',
        'input': '8px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        4: '1rem',      // 16px if html font-size is 16px, wait tailwind default 4 is 1rem
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        // Actually, the user's spacing 4, 8, 12, 16 etc. maps directly to standard Tailwind spacing multiplied by 4px. 
        // Tailwind default: 1 = 0.25rem (4px). 2 = 8px, 3 = 12px, 4 = 16px. 
        // I will keep default Tailwind spacing but use the specific numbers (1, 2, 3, 4, 5, 6, 8, 10, 12) which correspond to 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px.
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
