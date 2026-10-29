import { redirect } from '@sveltejs/kit'
import { routes } from '../../../../../routeDefs'
import type { PageLoad } from './$types'

export const load: PageLoad = () => {
	redirect(302, routes.tlaRoot())
}
