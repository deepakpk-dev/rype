import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rype: {
          red: "#E63946",
          yellow: "#F4D03F",
          orange: "#F39C12",
          leaf: "#7CB342",
          leafDark: "#558B2F",
          cream: "#FFF8EC",
          ink: "#1B2A1F",
          mute: "#6B7A6E",
          line: "#E8E3D6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(27, 42, 31, 0.08)",
        lift: "0 12px 32px -10px rgba(27, 42, 31, 0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.18)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "bounce-soft": "bounceSoft 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
