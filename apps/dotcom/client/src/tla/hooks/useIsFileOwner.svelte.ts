import { fromDerivedComputed } from './fromDerivedComputed.svelte'
import { getMaybeApp } from './useAppState.svelte'

export function getHasFileAdminRights(fileId: () => string | undefined): {
	readonly current: boolean
} {
	const app = getMaybeApp()
	return fromDerivedComputed('hasFileAdminRights', fileId, (id) => {
		const a = app.current
		return !!(a && id) && a.canUpdateFile(id)
	})
}
