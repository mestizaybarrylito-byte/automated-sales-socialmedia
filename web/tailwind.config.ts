import type { Config } from "tailwindcss";

/**
 * Brand-driven tokens resolve through CSS variables (set by
 * BrandThemeProvider from the active theme), keeping the `/opacity`
 * modifiers working via the <alpha-value> placeholder.
 */
function brandVar(name: string): string {
  return `rgb(var(--brand-${name}-rgb) / <alpha-value>)`;
}

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rust: {
          50: "#faf5f0",
          100: brandVar("soft-bg"),
          200: brandVar("soft-text"),
          300: "#d4ae8e",
          400: "#c08a63",
          500: "#a96f4a",
          600: brandVar("primary"),
          700: brandVar("primary"),
          800: brandVar("primary-deep"),
          900: "#563526",
          950: "#2e1a13",
        },
        charcoal: {
          50: "#f6f6f7",
          100: "#e3e4e6",
          200: "#c6c8cc",
          300: "#a3a6ab",
          400: "#7e8288",
          500: "#62666c",
          600: "#4e5157",
          700: "#3f4146",
          800: brandVar("surface"),
          900: brandVar("dark"),
          950: brandVar("dark"),
        },
        ember: brandVar("accent"),
        cream: brandVar("bg"),
      },
      fontFamily: {
        serif: ["var(--brand-font-heading)"],
        sans: ["var(--brand-font-body)"],
        accent: ["var(--brand-font-accent)"],
      },
    },
  },
  plugins: [],
};

export default config;
