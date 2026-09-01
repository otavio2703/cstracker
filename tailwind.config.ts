import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta CSTracker — dark theme com accent laranja CS-style
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",  // laranja principal
          600: "#ea6c0a",
          700: "#c2570a",
          800: "#9a3f07",
          900: "#7c3209",
        },
        surface: {
          950: "#0a0a0f",  // fundo mais escuro
          900: "#0f1117",  // fundo padrão
          850: "#141820",
          800: "#1a1f2e",  // cards
          700: "#222838",  // bordas/separadores
          600: "#2d3448",  // hover states
        },
        // Indicadores semânticos
        positive: "#22c55e",  // verde (bom K/D, etc)
        negative: "#ef4444",  // vermelho (mortes, etc)
        warning:  "#eab308",  // amarelo (médio)
        info:     "#3b82f6",  // azul (neutro)
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-brand": "0 0 20px -5px rgba(249, 115, 22, 0.3)",
        "glow-positive": "0 0 20px -5px rgba(34, 197, 94, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
