import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#030712",
          900: "#060D1F",
          800: "#0B1630",
          700: "#13213F",
          600: "#1E2F55",
        },
        cyan: {
          glow: "#22D3EE",
          electric: "#00E5FF",
        },
        teal: {
          brand: "#14B8A6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 8px 40px -8px rgba(34,211,238,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
