/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // 👈 Crucial to scan components
  theme: {
    extend: {
      colors: {
        rica: {
          500: "#62b445",
        },
      },
    },
  },
  plugins: [],
};
