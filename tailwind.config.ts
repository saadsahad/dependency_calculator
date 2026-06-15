import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",
        panel: "#11182B",
        accent: "#FF5A36",
        risk: {
          low: "#22C55E",
          medium: "#FACC15",
          high: "#FB923C",
          critical: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
