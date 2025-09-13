/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'heart-red': '#FF6B6B',
        'heart-blue': '#4ECDC4',
        'heart-green': '#45B7D1',
        'heart-purple': '#96CEB4',
        'heart-orange': '#FFEAA7',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neumorphic': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'neumorphic-inset': 'inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff',
      }
    },
  },
  plugins: [],
}
