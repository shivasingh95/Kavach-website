import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kavach: {
          bg: "#050816",
          "bg-alt": "#0a0f1e",
          card: "#0d1224",
          "card-hover": "#111936",
          cyan: "#00f0ff",
          violet: "#7c3aed",
          green: "#06d6a0",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "scan-line": "scan-line 8s linear infinite",
        "border-flow": "border-flow 3s linear infinite",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #050816 0%, #0a0f1e 50%, #0d1224 100%)",
        "gradient-accent": "linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(13, 18, 36, 0.8), rgba(10, 15, 30, 0.4))",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 240, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(0, 240, 255, 0.25)",
        "glow-violet": "0 0 30px rgba(124, 58, 237, 0.2)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
