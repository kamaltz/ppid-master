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
        primary: "#1e40af",
        secondary: "#3b82f6", 
        accent: "#10b981",
        "light-bg": "#f8fafc",
        "dark-text": "#1f2937",
        "light-text": "#6b7280",
        "border-light": "#e5e7eb",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-medium': 'marquee 20s linear infinite',
        'marquee-fast': 'marquee 10s linear infinite',
        'marquee-very-slow': 'marquee 45s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;