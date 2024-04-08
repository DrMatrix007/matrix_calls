import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
export default defineConfig({
    plugins: [sveltekit(), mkcert({})],
    server: {
        //     https: {
        //         key: fs.readFileSync(`${__dirname}/cert/key.pem`),
        //         cert: fs.readFileSync(`${__dirname}/cert/cert.pem`)
        //     },
        https: true,
        proxy: {}
    },

});
