/** @type {import('tailwindcss').Config} */
/** Minimalista amarillo - paleta personalizada */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				amarillo: {
					DEFAULT: '#FFD600', // Amarillo principal
					claro: '#FFF9E3',   // Fondo muy claro
					oscuro: '#FFC107',  // Amarillo oscuro
				},
				gris: {
					claro: '#F5F5F5',  // Fondo neutro
					medio: '#E0E0E0',
					oscuro: '#9E9E9E',
				},
				negro: '#222',
				blanco: '#fff',
			},
			fontFamily: {
				sans: ['Inter', 'Arial', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
