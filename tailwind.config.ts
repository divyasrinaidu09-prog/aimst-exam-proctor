import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aimst: {
          navy: "#0B1E38",
          navyDark: "#071426",
          navyLight: "#162D4D",
          blue: "#1E5BF0",
          blueHover: "#1549C7",
          teal: "#0D9488",
          green: "#10B981",
          gold: "#D97706",
          cardBg: "#FFFFFF",
          pageBg: "#F0F4F9",
          border: "#E2E8F0",
        },
        primary: {
          DEFAULT: "#1E5BF0",
          foreground: "#ffffff",
          dark: "#1549C7",
          light: "#EBF2FF",
        },
        sidebar: {
          DEFAULT: "#0B1E38",
          active: "#162D4D",
          hover: "#14263E",
          text: "#94A3B8",
          textActive: "#FFFFFF",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f8fafc",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 2px 8px -1px rgba(11, 30, 56, 0.06), 0 1px 3px -1px rgba(11, 30, 56, 0.04)",
        cardHover: "0 10px 20px -3px rgba(11, 30, 56, 0.09), 0 4px 6px -2px rgba(11, 30, 56, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
