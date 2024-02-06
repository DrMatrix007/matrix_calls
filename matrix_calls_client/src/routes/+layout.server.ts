import type { User } from "@auth/core/types";
import type { LayoutServerLoad } from "./$types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
function generate_jwt(data: User) {
	const token = jwt.sign(data, JWT_SECRET);
	return token;
}
function makeid(length: number) {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}
function generate_anon_user() {
	return {
		name: makeid(20),
		email: "",
	};
}

export const load: LayoutServerLoad = async (e) => {
	const session = (await e.locals.auth()) ?? { user: generate_anon_user() };

	const token = session?.user ? generate_jwt(session?.user) : null;
	return {
		jwt: token,
		session,
	};
};
