/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Brand colors
        brand: {
          primary: '#D174D2',
          destructive: '#E0563F',
          base: '#3F567F',
          deep: '#412653',
          white: '#FFFFFF',
        },
        // Theme colors using CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(63, 86, 127, 0.3), 0 2px 4px -1px rgba(63, 86, 127, 0.2)',
        'brand-lg': '0 10px 15px -3px rgba(63, 86, 127, 0.4), 0 4px 6px -2px rgba(63, 86, 127, 0.3)',
        'primary': '0 4px 6px -1px rgba(209, 116, 210, 0.3), 0 2px 4px -1px rgba(209, 116, 210, 0.2)',
        'destructive': '0 4px 6px -1px rgba(224, 86, 63, 0.3), 0 2px 4px -1px rgba(224, 86, 63, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
        'gradient-card': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
        'gradient-brand': 'linear-gradient(135deg, #D174D2 0%, #3F567F 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary))' },
          '50%': { boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};