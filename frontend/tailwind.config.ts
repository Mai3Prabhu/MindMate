import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          DEFAULT: '#9D8AFF', // More saturated purple for better contrast
          deep: '#7B61FF',   // Deeper shade for hover states
          light: '#D1C4FF',  // Lighter tint
        },
        // Accent colors
        accent: {
          yellow: '#F5C851', // More golden yellow for better contrast
          teal: '#5ED3C9',   // Brighter teal
          blush: '#FFA3B1',  // Softer pink
        },
        // Light theme colors
        light: {
          bg: '#F8F7FC',     // Soft off-white with lavender tint
          card: '#FFFFFF',   // Pure white cards
          text: '#2A2344',   // Deep muted purple for text
          'text-secondary': '#4A4568', // Slightly lighter for secondary text
          border: '#E3DEF7', // Soft lavender border
        },
        // Dark theme colors
        dark: {
          bg: '#1A1428',     // Deep purple-black
          card: '#241A36',   // Slightly lighter for cards
          deep: '#1E112B',   // Deeper shade for contrast
          text: '#F4EDFF',   // Soft lavender-white for text
          'text-secondary': '#D0C4E8', // Slightly dimmer for secondary text
          border: '#3A2F4F', // Brighter border for better visibility
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(202, 189, 255, 0.15)',
        'soft-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
