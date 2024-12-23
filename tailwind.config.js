/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blob: {
          "0%": {
            translate: "0 0",
            rotate: "0deg",
          },
          "30%": {
            rotate: "40deg",
          },
          "50%": {
            transform: "translate(50%, 50%) scale(1.1)",
          },
          "80%": {
            rotate: "90deg",
          },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideSide: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        blob: "blob 4s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045)",
        "blob-reverse":
          "blob 5s infinite cubic-bezier(0.215, 0.61, 0.355, 1) reverse",
        slideUp: "slideUp 0.2s ease-out",
        slideUpSlow: "slideUp 0.5s ease-out",
        fadeIn: "slideUp 0.4s ease-out",
        // slideSide: "slideSide 0.4s linear",
        slideSide: "slideSide 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
