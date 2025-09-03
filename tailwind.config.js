/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,md,html}",
    "./src/_includes/**/*.{njk,md,html}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f15",
        surface: "#121826",
        text: "#E6ECF3",
        accent: "#FF3366",
        neon: "#30D5FF",
        gold: "#FFD166"
      },
      borderRadius: { xl: "10px" }
    }
  },
  plugins: []
};
