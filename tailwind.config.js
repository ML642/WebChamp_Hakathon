/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 20px 60px rgba(24, 24, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
