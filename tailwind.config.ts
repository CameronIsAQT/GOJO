import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Dark ocean theme colors
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',  // Light sky blue
          400: '#38bdf8',  // Sky blue accent
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Very dark backgrounds
        dark: {
          50: '#1e293b',
          100: '#0f172a',
          200: '#0d1424',
          300: '#0a101c',
          400: '#080c14',
          500: '#05080e',
          600: '#030712',  // Main dark
          700: '#020509',
          800: '#010305',
          900: '#000102',
          950: '#000000',
        },
      },
      backgroundImage: {
        'eyes': "url('/eyes.png')",
      },
    },
  },
  plugins: [],
};
export default config;
