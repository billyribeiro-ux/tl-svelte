import { Environment } from '../types'

export function getSnapshotsTable(env: Environment) {
	if (env.SVELTE_DRAW_ENV === 'production') {
		return 'snapshots'
	} else if (env.SVELTE_DRAW_ENV === 'staging' || env.SVELTE_DRAW_ENV === 'preview') {
		return 'snapshots_staging'
	}
	return 'snapshots_dev'
}
