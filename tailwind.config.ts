/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        "theme-bg-base": "#f8f8fb", // main bg
        "theme-bg-accent": "#2a3042", // drawer
        "theme-bg-accent-dark": "#ffffff08", //drawer selection dark
        "theme-blue": "#556ee6",
        "bg-soft-blue": "",
        "theme-red": "#f46a6a",
        "theme-red-dark": "#f03b3b",
        "theme-gray": "#74788d",
        "theme-yellow": "#f1b44c",
        "theme-yellow-dark": "#eda01d",
        "theme-gray-dark": "#2a3042",
        "theme-text": "#495057",
        primary: "#556ee6",
        "primary-dark": "#2948df",
        "soft-primary": "rgba(85,110,230,.25)",
        "theme-selection": "ragba(152,167,240)",
        secondary: "#74788d",
        success: "#34c38f",
        info: "#50a5f1",
        warning: "#f1b44c",
        danger: "#f46a6a",
        light: "#eff2f7",
      },
    },
  },
  plugins: [],
};
