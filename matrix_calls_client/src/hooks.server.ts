import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import Spotify from "@auth/core/providers/spotify";

import type { Handle } from "@sveltejs/kit";

import {
	GITHUB_ID,
	GITHUB_SECRET,
	GOOGLE_ID,
	GOOGLE_SECRET,
	SPOTIFY_ID,
	SPOTIFY_SECRET,
    JWT_SECRET,
} from "$env/static/private";

export const handle = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET,
		}),
		GitHub({
			clientSecret: GITHUB_SECRET,
			clientId: GITHUB_ID,
		}),
		Spotify({
			clientId: SPOTIFY_ID,
			clientSecret: SPOTIFY_SECRET,
		}),
	],
	trustHost: true,
	secret: JWT_SECRET,
}) satisfies Handle;

