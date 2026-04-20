import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem"
      }
    },
    extend: {
      colors: {
        border: "#d7dfdc",
        input: "#d7dfdc",
        ring: "#0c6d62",
        background: "#f5f7f4",
        foreground: "#12211d",
        primary: {
          DEFAULT: "#0c6d62",
          foreground: "#f6fffd"
        },
        secondary: {
          DEFAULT: "#d9ece6",
          foreground: "#16352f"
        },
        muted: {
          DEFAULT: "#eef3f0",
          foreground: "#5a6a65"
        },
        accent: {
          DEFAULT: "#e8f4ef",
          foreground: "#155145"
        },
        destructive: {
          DEFAULT: "#b83f3f",
          foreground: "#fff8f8"
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#12211d"
        },
        dashboard: {
          base: "#f5f7f4",
          panel: "#ffffff",
          tint: "#eff7f4",
          ink: "#132420",
          line: "#cdd9d4",
          warning: "#d88a1d",
          success: "#27835e",
          danger: "#a94444"
        }
      },
      boxShadow: {
        soft: "0 14px 40px -24px rgba(17, 36, 29, 0.25)",
        panel: "0 10px 30px -18px rgba(18, 33, 29, 0.18)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"]
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.72" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

