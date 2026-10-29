<script lang="ts">
	import { onMount } from 'svelte'

	// Replaces `app/analytics.tsx`. `process.env.NEXT_PUBLIC_*` are inlined by vite.config.ts.
	onMount(() => {
		window.TL_GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
		window.TL_GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
		window.TL_GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID

		const handleCopy = (copyEvent: ClipboardEvent) => {
			const isWithinCodeBlock = (copyEvent.target as HTMLElement | null)?.closest('pre, code')
			if (isWithinCodeBlock) {
				const copiedText = window.getSelection()?.toString() || ''

				if (window.tlanalytics?.trackCopyCode) {
					window.tlanalytics.trackCopyCode({
						page_category: 'docs',
						text_snippet: copiedText,
					})
				}

				// Track Google Ads conversion for code block copies
				if (window.tlanalytics?.gtag) {
					window.tlanalytics.gtag('event', 'conversion', {
						send_to: 'AW-17268182782/qIuDCMnhl_EaEP6djqpA',
						value: 1.0,
						currency: 'USD',
					})
				}
			}
		}
		document.addEventListener('copy', handleCopy)

		// next/script with strategy="afterInteractive": inject once the page is interactive.
		const script = document.createElement('script')
		script.id = 'svelte-draw-analytics'
		script.type = 'text/javascript'
		script.async = true
		script.defer = true
		script.src = import.meta.env.DEV
			? 'http://localhost:5173/tl-analytics.js'
			: 'https://analytics.svelte-draw.invalid/tl-analytics.js'
		document.body.appendChild(script)

		return () => {
			document.removeEventListener('copy', handleCopy)
			script.remove()
		}
	})
</script>
