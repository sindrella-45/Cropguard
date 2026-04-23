import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cropguard: {
          darkest:       "#0F1A08",
          dark:          "#1A2F0E",
          mid:           "#2D4A1A",
          card:          "#243D12",
          border:        "#4A7A28",
          borderLight:   "#3D6B1E",
          textPrimary:   "#F5F0E8",
          textSecondary: "#B4DC78",
          textMuted:     "#7AAD45",
          accent:        "#6AAB35",
          accentLight:   "#8BC34A",
          tagBg:         "#2A4A15",
          tagBorder:     "#4A7A28",
          tagText:       "#B4DC78",
          success:       "#27AE60",
          warning:       "#E67E22",
          danger:        "#C0392B",
          info:          "#2980B9",
        },
      },
      backgroundImage: {
        "cropguard-gradient":
          "linear-gradient(160deg, #0F1A08 0%, #1A2F0E 40%, #2D4A1A 100%)",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
      },
      animation: {
        "fade-in":  "fadeIn 0.5s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;