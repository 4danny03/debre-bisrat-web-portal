
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./index.html",
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				church: {
					'burgundy': '#8B0000',
					'gold': '#D4AF37',
					'cream': '#FFF8E1',
					'light': '#F8F8FF',
					'dark': '#2D2926',
					'green': '#006400', // Ethiopian flag green
					'yellow': '#FFDC00', // Ethiopian flag yellow
					'red': '#AA0000', // Ethiopian flag red
					'tabot-gold': '#FFD700', // For highlighting sacred elements
					'cross-brown': '#8B4513', // Ethiopian cross color
					'papyrus': '#F5DEB3', // Traditional manuscript color
					'icon-blue': '#1E90FF', // Color from St. Gabriel icon
					'icon-red': '#B22222'   // Another color from St. Gabriel icon
				}
			},
			fontFamily: {
				'serif': ['Georgia', 'Cambria', 'serif'],
				'sans': ['Inter', 'sans-serif'],
				'amharic': ['Nyala', 'Arial', 'sans-serif']
			},
			backgroundImage: {
				'ethiopian-cross': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" fill=\"none\"%3E%3Cpath d=\"M20 5V35M5 20H35M12 12L28 28M28 12L12 28\" stroke=\"%238B0000\" stroke-opacity=\"0.07\" stroke-width=\"2\"/%3E%3C/svg%3E')",
				'lalibela-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%238B0000\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
			},
			// Add Ethiopian-inspired border patterns
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF37' 
					},
					'50%': { 
						boxShadow: '0 0 20px #D4AF37, 0 0 30px #D4AF37' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade 0.5s ease-in-out',
				'slide-in': 'slide 0.5s ease-in-out',
				'holy-glow': 'glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
