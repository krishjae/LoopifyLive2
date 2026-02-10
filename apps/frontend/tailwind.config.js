export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      colors: {
        bg: {
          DEFAULT: "#06060F",
          secondary: "#0A0A1B",
          tertiary: "#0E0E24"
        },
        surface: {
          DEFAULT: "#12122A",
          light: "rgba(120, 80, 255, 0.06)",
          hover: "rgba(120, 80, 255, 0.10)"
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          light: "rgba(255, 255, 255, 0.10)",
          accent: "rgba(139, 92, 246, 0.20)"
        },
        text: {
          DEFAULT: "#EDEEFE",
          secondary: "rgba(237, 238, 254, 0.60)",
          muted: "rgba(237, 238, 254, 0.40)"
        },
        accent: {
          violet: "#8B5CF6",
          fuchsia: "#D946EF",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E",
          emerald: "#10B981"
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px'
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(139, 92, 246, 0.15)',
        'glow-md': '0 0 30px rgba(139, 92, 246, 0.20)',
        'glow-lg': '0 4px 40px rgba(139, 92, 246, 0.30)',
        'glow-fuchsia': '0 0 30px rgba(217, 70, 239, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.40), 0 2px 8px rgba(0, 0, 0, 0.30)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(245, 158, 11, 0.7), 0 0 48px rgba(245, 158, 11, 0.3)' }
        }
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '40px',
        '3xl': '64px'
      }
    }
  },
  plugins: []
};
