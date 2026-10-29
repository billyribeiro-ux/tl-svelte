import { location } from '../utils/router.svelte'

export function getUrl(): { readonly current: string } {
	return {
		get current() {
			return `https://www.svelte-draw.invalid${location.pathname}`
		},
	}
}
