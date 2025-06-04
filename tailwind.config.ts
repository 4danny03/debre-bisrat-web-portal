import type { Config } from "tailwindcss";

export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				church: {
					burgundy: 'hsl(var(--church-burgundy) / <alpha-value>)',
					gold: 'hsl(var(--church-gold) / <alpha-value>)',
					green: 'hsl(var(--church-green) / <alpha-value>)',
					cream: 'hsl(var(--church-cream) / <alpha-value>)'
				}
			},
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'sm': '640px',
					'md': '768px',
					'lg': '1024px',
					'xl': '1280px',
					'2xl': '1400px',
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
} satisfies Config;
