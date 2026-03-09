/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "slide-in-error": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "direction-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "success-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "dropdown-in": {
          from: { opacity: "0", transform: "translateY(-8px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 4px 16px rgba(255, 255, 255, 0.05)" },
          "50%": { boxShadow: "0 4px 24px rgba(255, 255, 255, 0.1)" },
        },
        "spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "shimmer": "shimmer 2s ease-in-out infinite",
        "slide-in-error": "slide-in-error 0.25s ease",
        "direction-spin": "direction-spin 0.35s ease",
        "fade-in": "fade-in 0.3s ease",
        "success-pop": "success-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "dropdown-in": "dropdown-in 0.2s ease",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "spin": "spin 0.7s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
