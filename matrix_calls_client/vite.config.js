import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
export default defineConfig({
    plugins: [sveltekit()],

});
