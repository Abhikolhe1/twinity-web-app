import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#9a78fe',
          dark: '#422266',
          mid: '#6B3FA0',
          black: '#301b4c',
        },
        surface: {
          page: '#F8F5FF',
          white: '#FFFFFF',
          subtle: '#F0EBFF',
          card: '#FFFFFF',
          elevated: '#EDE5FF',
        },
        content: {
          primary: '#1a0a30',
          secondary: '#4a3465',
          muted: '#8b7aaa',
          placeholder: '#c4b8d8',
        },
      },
      fontFamily: {
        aeonik: ['AeonikPro', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #9a78fe 0%, #422266 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #b89aff 0%, #9a78fe 50%, #6B3FA0 100%)',
        'purple-wash': 'linear-gradient(135deg, #F8F5FF 0%, #FFFFFF 40%, #F3EEFF 100%)',
        'purple-card': 'linear-gradient(145deg, #FAF7FF, #F3EEFF)',
      },
      boxShadow: {
        'purple': '0 4px 20px rgba(154, 120, 254, 0.18)',
        'purple-lg': '0 8px 40px rgba(154, 120, 254, 0.25)',
        'purple-sm': '0 2px 10px rgba(154, 120, 254, 0.12)',
        'card': '0 1px 3px rgba(154,120,254,0.06), 0 4px 16px rgba(154,120,254,0.04)',
        'card-hover': '0 4px 20px rgba(154,120,254,0.12), 0 8px 40px rgba(154,120,254,0.06)',
        'button': '0 4px 12px rgba(154, 120, 254, 0.35)',
      },
      animation: {
        'float': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(154, 120, 254, 0.18)' },
          '50%': { boxShadow: '0 4px 40px rgba(154, 120, 254, 0.40)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
