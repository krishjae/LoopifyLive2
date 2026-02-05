export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      colors: {
        bg: "#050615",
        surface: "#0A0B1F",
        border: "rgba(255,255,255,0.08)",
        text: "#EDEEFE",
        muted: "rgba(237,238,254,0.68)"
      }
    }
  },
  plugins: []
};
