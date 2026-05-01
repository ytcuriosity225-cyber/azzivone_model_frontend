import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'azzivone-navy': '#000814',
        'azzivone-blue-deep': '#001d3d',
        'azzivone-blue-mid': '#003566',
        'electric-blue': '#00b4d8',
        'electric-glow': '#90e0ef',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "futuristic-blue": "linear-gradient(to bottom, #000814, #001d3d, #003566)",
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
