import { getUiEvents, type TLUiEventSource } from 'svelte-draw'
import { openUrl } from '../utils/url'

export function getOpenUrlAndTrack(source: TLUiEventSource) {
	const trackEvent = getUiEvents()
	return (url: string, allowReferrer?: boolean) => {
		trackEvent('open-url', { source, destinationUrl: url })
		openUrl(url, allowReferrer)
	}
}
