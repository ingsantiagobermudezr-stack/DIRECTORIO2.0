/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Mercado Libre inspired yellow theme
        primary: {
          50: "#FFF9E6",
          100: "#FFF3CC",
          200: "#FFE699",
          300: "#FFD966",
          400: "#FFCC33",
          500: "#FFE600", // Main yellow (Mercado Libre style)
          600: "#E6CF00",
          700: "#CCB800",
          800: "#B3A100",
          900: "#998A00",
        },
        secondary: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9", // Blue for accents
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
      },
    },
  },
  plugins: [],
}

