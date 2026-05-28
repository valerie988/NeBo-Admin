/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#F0FAF4",
          100: "#D8F3DC",
          200: "#B7E4C7",
          400: "#52B788",
          600: "#2D6A4F",
          700: "#1B4332",
          900: "#081C15",
        },
      },
    },
  },
  plugins: [],
};
