import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/remarkable': {
				target: 'http://10.11.99.1',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/remarkable/, ''),
				configure: (proxy) => {
					proxy.on('error', (err) => {
						console.log('proxy error', err);
					});
				}
			}
		}
	}
});
