import type { User } from "@auth/core/types";
import type { LayoutServerLoad } from "./$types";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "$env/static/private";
function generate_jwt(data: User) {
  const token = jwt.sign(data, JWT_SECRET);
  return token;
}

export const load: LayoutServerLoad = async (e) => {
  const session = await e.locals.auth();
  const token = session?.user ? generate_jwt(session?.user) : null;
  return {
    jwt: token,
    session,
  }
} 
