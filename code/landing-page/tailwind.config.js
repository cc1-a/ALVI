/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF",
        surface: "#F3F3F6",
        primary: "#454545",
        muted: "#6E6E73",
        subtle: "#636363",
        numeral: "#BEBEBE",
        divider: "#DEDEDE",
        darkPill: "#454545",
        darkPillHover: "#1D1D1F",
        slateAccent: "#5B6B7E",
        slateLight: "#8B9BAB",
        slateMist: "rgba(91, 107, 126, 0.08)",
        frostedBorder: "rgba(222, 222, 222, 0.6)",
      },
      fontFamily: {
        sans: [
          '"Oakes Grotesk"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'sans-serif',
        ],
      },
      borderRadius: {
        pill: "100px",
        card: "32px",
        hud: "20px",
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
