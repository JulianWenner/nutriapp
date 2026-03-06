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
        background: "var(--background)",
        foreground: "var(--foreground)",
        teal: {
          DEFAULT: '#0D7C72',
          light: '#E8F5F3',
          mid: '#5BB8AE',
        },
        dark: '#1A2E2C',
        border: '#D4E8E5',
      },
    },
  },
  plugins: [],
};
export default config;
