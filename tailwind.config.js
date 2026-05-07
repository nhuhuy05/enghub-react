/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004ac6",
        "on-primary": "#ffffff",
        background: "#faf8ff",
        surface: "#faf8ff",
        "on-surface": "#191b23",
        "on-surface-variant": "#434655",
        secondary: "#505f76",
        "surface-container-low": "#f3f3fe",
        "surface-container": "#ededf9",
        "outline-variant": "#c3c6d7",
        error: "#ba1a1a",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        '2xl': "1rem",
      },
    },
  },
  plugins: [],
}
