/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./src/*.{js,jsx}", "./src/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#1B73E8",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
};
