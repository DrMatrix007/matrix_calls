import { sveltekit } from '@sveltejs/kit/vite';
import mkcert from 'vite-plugin-mkcert'
import { defineConfig } from 'vite';
import https from 'https'
export default defineConfig({
    plugins: [sveltekit()],

});
