/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        sidebar: '#1e1e2d',
        'sidebar-hover': '#2d2d3f',
        'alert-critical': '#e74c3c',
        'alert-warning': '#6b7280',
      }
    },
  },
  plugins: [],
}
