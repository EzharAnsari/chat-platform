import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f172a",
        panel: "#111827",
        border: "#1f2937",
        muted: "#9ca3af",
        primary: "#3b82f6",
      },
    },
  },
  plugins: [],
};

export default config;