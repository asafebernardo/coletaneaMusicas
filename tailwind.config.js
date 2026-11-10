/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        pine: {
          DEFAULT: "rgb(var(--pine) / <alpha-value>)",
          dark: "rgb(var(--pine-dark) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
        },
        "voice-men": "rgb(var(--voice-men) / <alpha-value>)",
        "voice-women": "rgb(var(--voice-women) / <alpha-value>)",
      },
      fontFamily: {
        lyric: ['"Iowan Old Style"', '"Palatino Linotype"', "Palatino", "Georgia", "serif"],
      },
      maxWidth: {
        phone: "28rem",
      },
      screens: {
        "landscape-mobile": { raw: "(orientation: landscape) and (max-height: 540px)" },
        "desktop-card": { raw: "(min-width: 640px) and (min-height: 541px)" },
      },
    },
  },
  plugins: [],
};
