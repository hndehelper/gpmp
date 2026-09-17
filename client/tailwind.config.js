/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#3b82f6',
          panic: '#ef4444',
          gold: '#eab308',
          success: '#10b981',
          saffron: '#f59e0b'
        }
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    },
  },
  plugins: [],
}
