import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-to-top": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "slide-out-to-bottom": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "slide-out-to-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "slide-out-to-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "spin-in": {
          "0%": { transform: "rotate(-180deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "rotate(0deg) scale(1)", opacity: "1" },
        },
        "spin-out": {
          "0%": { transform: "rotate(0deg) scale(1)", opacity: "1" },
          "100%": { transform: "rotate(180deg) scale(0.8)", opacity: "0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "30%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(0.3)", opacity: "0" },
        },
        "flip-in": {
          "0%": { transform: "perspective(400px) rotateY(90deg)", opacity: "0" },
          "40%": { transform: "perspective(400px) rotateY(-20deg)" },
          "60%": { transform: "perspective(400px) rotateY(10deg)" },
          "80%": { transform: "perspective(400px) rotateY(-5deg)" },
          "100%": { transform: "perspective(400px) rotateY(0deg)", opacity: "1" },
        },
        "flip-out": {
          "0%": { transform: "perspective(400px) rotateY(0deg)", opacity: "1" },
          "100%": { transform: "perspective(400px) rotateY(90deg)", opacity: "0" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "zoom-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.5)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "aurora": {
          "0%": {
            transform: "rotate(0deg) scale(1) translate(-20%, -20%)",
            opacity: "0.4",
          },
          "25%": {
            transform: "rotate(90deg) scale(1.2) translate(-10%, -30%)",
            opacity: "0.6",
          },
          "50%": {
            transform: "rotate(180deg) scale(0.9) translate(-30%, -10%)",
            opacity: "0.5",
          },
          "75%": {
            transform: "rotate(270deg) scale(1.1) translate(-15%, -25%)",
            opacity: "0.7",
          },
          "100%": {
            transform: "rotate(360deg) scale(1) translate(-20%, -20%)",
            opacity: "0.4",
          },
        },
        "aurora-secondary": {
          "0%": {
            transform: "rotate(180deg) scale(0.8) translate(20%, 20%)",
            opacity: "0.3",
          },
          "33%": {
            transform: "rotate(270deg) scale(1.3) translate(10%, 30%)",
            opacity: "0.5",
          },
          "66%": {
            transform: "rotate(360deg) scale(0.7) translate(30%, 10%)",
            opacity: "0.4",
          },
          "100%": {
            transform: "rotate(540deg) scale(0.8) translate(20%, 20%)",
            opacity: "0.3",
          },
        },
        "aurora-tertiary": {
          "0%": {
            transform: "rotate(45deg) scale(1.1) translate(-40%, 40%)",
            opacity: "0.2",
          },
          "50%": {
            transform: "rotate(225deg) scale(0.9) translate(40%, -40%)",
            opacity: "0.4",
          },
          "100%": {
            transform: "rotate(405deg) scale(1.1) translate(-40%, 40%)",
            opacity: "0.2",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.5s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.5s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.5s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.5s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.5s ease-out",
        "slide-out-to-bottom": "slide-out-to-bottom 0.5s ease-out",
        "slide-out-to-left": "slide-out-to-left 0.5s ease-out",
        "slide-out-to-right": "slide-out-to-right 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "scale-out": "scale-out 0.5s ease-out",
        "spin-in": "spin-in 0.5s ease-out",
        "spin-out": "spin-out 0.5s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        "bounce-out": "bounce-out 0.5s ease-out",
        "flip-in": "flip-in 0.5s ease-out",
        "flip-out": "flip-out 0.5s ease-out",
        "zoom-in": "zoom-in 0.5s ease-out",
        "zoom-out": "zoom-out 0.5s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "aurora": "aurora 18s ease-in-out infinite",
        "aurora-secondary": "aurora-secondary 22s ease-in-out infinite reverse",
        "aurora-tertiary": "aurora-tertiary 25s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
