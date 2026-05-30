/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#0a0f1d",
        bgSecondary: "#111827",
        bgTertiary: "#1f2937",
        accentPurple: "hsl(263, 90%, 66%)",
        accentCyan: "hsl(190, 95%, 50%)",
        accentPink: "hsl(325, 90%, 60%)",
        'brand-gray': '#1A1A1A',
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
