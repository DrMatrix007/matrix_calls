import { page } from "$app/stores";
import { derived } from "svelte/store";

export const current_user = derived(page, (page) => page.data.session?.user);
