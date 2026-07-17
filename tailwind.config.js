/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans, Manrope)', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 40, 24, 0.04), 0 4px 12px rgba(11, 40, 24, 0.04)',
        medium: '0 4px 10px rgba(11, 40, 24, 0.06), 0 12px 32px rgba(11, 40, 24, 0.10)',
      },
    },
  },
  plugins: [],
}
