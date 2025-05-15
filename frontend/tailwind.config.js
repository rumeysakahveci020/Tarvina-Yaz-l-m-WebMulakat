// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'book-fall': 'fall 7s linear infinite',
      },
      keyframes: {
        fall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '0.8' },
          '20%': { transform: 'translateY(20vh) rotate(-10deg)', opacity: '0.7' },
          '40%': { transform: 'translateY(40vh) rotate(5deg)', opacity: '0.6' },
          '60%': { transform: 'translateY(60vh) rotate(-15deg)', opacity: '0.5' },
          '80%': { transform: 'translateY(80vh) rotate(10deg)', opacity: '0.4' },
          '100%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // require('@tailwindcss/line-clamp'), // BU SATIR KALDIRILDI VEYA YORUMA ALINDI
  ],
}