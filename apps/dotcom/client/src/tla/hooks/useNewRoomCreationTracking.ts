import { trackEvent } from '../../utils/analytics'
import type { SvelteDrawApp } from '../app/SvelteDrawApp'

export function getNewRoomCreationTracking() {
	return (app: SvelteDrawApp | null, fileId: string) => {
		if (!app) return

		const creationData = app.getAndClearNewRoomCreationStartTime(fileId)

		if (creationData === null) return

		// Send analytics data to PostHog
		trackEvent('room_creation_duration', {
			creation_time_ms: Date.now() - creationData.startTime,
			source: creationData.source,
		})
	}
}
