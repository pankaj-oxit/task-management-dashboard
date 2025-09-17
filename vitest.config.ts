import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'src/app.html',
				'src/lib/index.ts',
			],
		},
	},
});
