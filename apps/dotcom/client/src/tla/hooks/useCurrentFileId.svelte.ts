import { params } from '../../utils/router.svelte'

export function getCurrentFileId(): { readonly current: string | undefined } {
	return {
		get current() {
			return params.fileSlug
		},
	}
}
