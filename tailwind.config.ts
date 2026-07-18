import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./pages/**/*.html", "./scripts/**/*.ts"],
  theme: {
    extend: {
      colors: {
        bg: { primary: "#0A0A0A", secondary: "#111111", tertiary: "#1A1A1A" },
        accent: { cyan: "#00E5FF", magenta: "#FF00A0", gold: "#FFD700" },
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: { none: "0", sm: "2px" },
      animation: {
        morph: "morph 4s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "fade-in": "fadeIn 0.6s ease-out",
      },
      keyframes: {
        morph: {
          "0%,100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
