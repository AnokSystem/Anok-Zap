
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Paleta de Cores Roxas
				purple: {
					50: '#faf5ff',
					100: '#f3e8ff',
					200: '#e9d5ff',
					300: '#d8b4fe',
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7c3aed',
					800: '#6b46c1',
					900: '#581c87',
					950: '#3b0764',
					primary: 'rgb(var(--purple-primary))',
					secondary: 'rgb(var(--purple-secondary))',
					light: 'rgb(var(--purple-light))',
					dark: 'rgb(var(--purple-dark))'
				},
				// Cores Neutras
				gray: {
					dark: 'rgb(var(--gray-dark))',
					medium: 'rgb(var(--gray-medium))',
					light: 'rgb(var(--gray-light))'
				},
				// Cor de Destaque
				yellow: {
					accent: 'rgb(var(--yellow-accent))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				roboto: ['Roboto', 'system-ui', 'sans-serif'],
				montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
				sans: ['Roboto', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'xs': '0.75rem',     // 12px
				'sm': '0.875rem',    // 14px
				'base': '1rem',      // 16px
				'lg': '1.125rem',    // 18px
				'xl': '1.25rem',     // 20px
				'2xl': '1.5rem',     // 24px
				'3xl': '1.875rem',   // 30px
				'4xl': '2.25rem',    // 36px
			},
			spacing: {
				'18': '4.5rem',      // 72px
				'20': '5rem',        // 80px
				'24': '6rem',        // 96px
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-primary-hover': 'var(--gradient-primary-hover)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-header': 'var(--gradient-header)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'strong': 'var(--shadow-strong)',
				'purple': 'var(--shadow-purple)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'pulse-glow': {
					'0%': {
						boxShadow: '0 0 20px rgba(107, 70, 193, 0.3)'
					},
					'100%': {
						boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
