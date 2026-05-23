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
      colors: {
        // Master UI Design System
        background: "var(--bg-mid)",
        foreground: "var(--cream)",

        ff: {
          deep: "#0C1130",
          mid: "#0F1640",
          glow: "#162156",
          surface: "#141B3D",
          "surface-2": "#1B2348",
          cream: "#EDE8DC",
          "cream-muted": "rgba(237,232,220,0.45)",
          "cream-faint": "rgba(237,232,220,0.18)",
          gold: "#C9A257",
          "gold-muted": "rgba(201,162,87,0.15)",
          "gold-border": "rgba(201,162,87,0.3)",
          green: "#1C3929",
          "green-light": "#3E8C60",
          "green-border": "rgba(62,140,96,0.25)",
        },

        // Legacy compatibility tokens mapped to new system
        glass: {
          dark: "var(--surface)",
          "dark-border": "var(--border)",
          light: "var(--surface-2)",
          "light-border": "var(--border-hover)",
        },

        // shadcn/ui semantic tokens (unified dark)
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--cream)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--cream)",
        },
        primary: {
          DEFAULT: "var(--gold)",
          foreground: "#0C1130",
        },
        secondary: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--cream)",
        },
        muted: {
          DEFAULT: "var(--surface)",
          foreground: "var(--cream-muted)",
        },
        accent: {
          DEFAULT: "var(--gold-muted)",
          foreground: "var(--gold)",
        },
        destructive: {
          DEFAULT: "#E05040",
          foreground: "#FFFFFF",
        },
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--gold)",
        sidebar: {
          DEFAULT: "var(--bg-deep)",
          foreground: "var(--cream)",
          primary: "var(--gold)",
          "primary-foreground": "#0C1130",
          accent: "var(--surface-2)",
          "accent-foreground": "var(--cream)",
          border: "var(--border)",
          ring: "var(--gold)",
        },
      },
      fontFamily: {
        sans: ["'Syne'", "system-ui", "sans-serif"],
        display: ["'Fraunces'", "serif"],
        heading: ["'Fraunces'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "14px",
        "2xl": "18px",
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease",
        bounce: "cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
