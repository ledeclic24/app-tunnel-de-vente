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
        // Élévation légère pour une carte au repos (fond très clair) — jamais
        // d'ombre plus lourde tant que l'élément n'est pas actif/survolé.
        soft: '0 1px 2px 0 rgb(12 31 22 / 0.04), 0 2px 8px -2px rgb(12 31 22 / 0.06)',
        // Hover/actif : un cran au-dessus de `soft`, jamais utilisée seule au repos.
        medium: '0 4px 12px -2px rgb(12 31 22 / 0.10), 0 8px 24px -4px rgb(12 31 22 / 0.10)',
      },
    },
  },
  plugins: [],
}
