import type { Config } from "tailwindcss";

// Design tokens mirror day-1-gratitude.html — the "Mirror" look.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",
        "ink-2": "#10162A",
        lime: "#C6FF3D",
        orange: "#FF5A2C",
        blue: "#3D7BFF",
        violet: "#6E2BFF",
        mist: "#8A92A6",
      },
      fontFamily: {
        display: ['"Archivo Black"', "sans-serif"],
        heading: ['"Archivo"', "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
