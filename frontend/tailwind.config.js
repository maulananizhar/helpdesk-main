/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Aktifkan dark mode berbasis kelas
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        primary: "#193cb8", // Warna biru
        "primary-hover": "#1638aa", // Warna biru gelap
        secondary: "#f4f8fd", // Warna biru muda
      },
    },
  },
  plugins: [],
};
