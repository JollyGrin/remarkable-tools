import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	preview: {
		host: '0.0.0.0',
		port: Number(process.env.PORT) || 3000,
		strictPort: true,
		// Allow Railway domains
		allowedHosts: ['remarkable-tools-client-production.up.railway.app', '.railway.app']
	}
});
