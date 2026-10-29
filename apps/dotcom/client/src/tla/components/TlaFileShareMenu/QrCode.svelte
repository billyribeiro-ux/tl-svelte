<script lang="ts">
	import { FileHelpers, fromComputed } from 'svelte-draw'
	import { getGlobalEditor } from '../../../utils/globalEditor'
	import { getLocalSessionState } from '../../utils/local-session-state'
	import { createQRCodeImageDataString } from '../../utils/qrcode'
	import styles from './file-share-menu.module.css'

	let { url }: { url: string } = $props()

	// Not cached in localStorage: the url carries the viewport, so every camera move would add a
	// new data-url entry that nothing ever evicts.
	let qrCode = $state<string | null>(null)

	const theme = fromComputed('is dark mode', () => getLocalSessionState().theme)
	const editor = getGlobalEditor()

	$effect(() => {
		if (!editor.current) return
		const currentUrl = url

		createQRCodeImageDataString(currentUrl).then((svgString) => {
			const blob = new Blob([svgString], { type: 'image/svg+xml' })
			FileHelpers.blobToDataUrl(blob).then((dataUrl) => (qrCode = dataUrl))
		})
	})

	// todo: click qr code to... copy? big modal?
</script>

<div class={styles.fileShareMenuQrCode}>
	<!-- We want to use an image element here so that a user can right click and copy / save / drag the qr code -->
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src={qrCode ?? undefined} class={styles.fileShareMenuQrCodeInner} data-theme={theme.current} />
</div>
