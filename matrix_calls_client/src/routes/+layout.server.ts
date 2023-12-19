import type { LayoutServerLoad } from "./$types";


export const load: LayoutServerLoad = async (e) => {
  return {
    session: await e.locals.getSession()
  }
}
