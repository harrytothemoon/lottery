/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "law-blue": "#1E2732",
        "law-gold": "#F7D538",
      },
      backgroundImage: {
        "law-gradient":
          "linear-gradient(180deg, #ecdc91, #fff4c1 51.56%, #ffb600, #655d7c)",
      },
      keyframes: {
        snowfall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: 1 },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: 0.3,
          },
        },
        glow: {
          "0%, 100%": { textShadow: "0 0 4px #ffd700" },
          "50%": { textShadow: "0 0 8px #ffd700, 0 0 12px #ffd700" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      animation: {
        snowfall: "snowfall linear infinite",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "pulse-slow": "pulse 3s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};
