<script lang="ts">
	import { onMount } from 'svelte'
	import { runtime, setRuntimeOverrides } from 'svelte-draw'
	import { trackEvent } from '../../utils/analytics'

	// Override watermark URLs globally for all dotcom editors
	onMount(() => {
		const originalOpenWindow = runtime.openWindow
		setRuntimeOverrides({
			openWindow(url: string, target: string, allowReferrer?: boolean) {
				if (url.includes('utm_campaign=watermark')) {
					url = url.replace('utm_source=sdk', 'utm_source=dotcom')
					trackEvent('click-watermark', { url })
				}
				originalOpenWindow(url, target, allowReferrer)
			},
		})
	})
</script>
