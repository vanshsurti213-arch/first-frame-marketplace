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
        // Firstframe V2 Design System
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Brand tokens
        ff: {
          lime: "#CAFF4C",
          "lime-hover": "#B8F030",
          "lime-muted": "rgba(202,255,76,0.12)",
          black: "#0C0C0F",
          coral: "#FF6B5B",
          sky: "#5BAAFF",
          jade: "#2DD4A1",
          amber: "#FFB547",
        },

        // Glass surfaces
        glass: {
          dark: "rgba(255,255,255,0.04)",
          "dark-border": "rgba(255,255,255,0.09)",
          light: "rgba(255,255,255,0.72)",
          "light-border": "rgba(0,0,0,0.07)",
        },

        // shadcn/ui semantic tokens
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "system-ui", "sans-serif"],
        heading: ["'Syne'", "system-ui", "sans-serif"],
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
