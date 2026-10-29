import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({ fallback: 'index.html' }),
			router: { type: 'hash' },
			appDir: 'app', // les noms commençant par _ sont réservés par l'hébergement Artifact
			// GitHub Pages sert le site sous /rpg-habitudes : BASE_PATH est défini par le workflow de déploiement
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` }
		})
	],
});
