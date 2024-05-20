import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import Spotify from "@auth/core/providers/spotify";
import { PrismaClient } from '@prisma/client'
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
import Credentials from "@auth/core/providers/credentials";

const prisma = new PrismaClient();

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
        Credentials({
            name: "Creds",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },

            },
            authorize: async (credentials, _req) => {
                // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
                //
                const { email, password } = credentials as { email: string | undefined, password: string | undefined };
                console.log(credentials)
                if (!email || !password) return null;
                // try {
                // Check if user exists
                let user = await prisma.user.findUnique({
                    where: { email }
                });
                
                if (!user) {
                    // If user does not exist, create a new user
                    user = (await prisma.user.create({
                        data: {
                            email,
                            password
                        },
                    }));

                }
                console.log(user)
                // Add any additional checks or logic here if needed

                if(user?.password != password) {
                    return null;
                }
                // Return the user object
                return {
                    name: email,
                    email: email
                };
                // } catch (error) {
                //     console.error('Error during user authorization:', error);
                //     return null;
                // }
            }
        })
    ],
    trustHost: true,
    secret: JWT_SECRET,
}) satisfies Handle;

