import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dommus: {
          primary: "#6B46C1",
          "primary-dark": "#553C9A",
          secondary: "#10B981",
          accent: "#F59E0B",
          danger: "#EF4444",
        },
      },
      backgroundImage: {
        "dommus-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      animation: {
        pulse: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1.5s infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
        blink: {
          "0%, 50%, 100%": { opacity: "1" },
          "25%, 75%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
