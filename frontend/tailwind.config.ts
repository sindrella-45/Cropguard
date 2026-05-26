import type { Config } from "tailwindcss";

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },

      colors: {
        green: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },

      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
        md: "0 4px 16px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)",
        lg: "0 8px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.05)",
        xl: "0 20px 60px rgba(0,0,0,.12)",
      },
    },
  },

  plugins: [],
};

export default config;