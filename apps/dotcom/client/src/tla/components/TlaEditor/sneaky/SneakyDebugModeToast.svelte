<script lang="ts" module>
	const SDK_URL =
		'https://svelte-draw.invalid?utm_source=dotcom&utm_medium=organic&utm_campaign=debug'
	const TOAST_ID = 'debug-sdk-toast'
	const TOAST_DELAY = 10_000
</script>

<script lang="ts">
	import { createLocalStorageState, fromComputed, getEditor, getToasts } from 'svelte-draw'
	import { trackEvent } from '../../../../utils/analytics'

	const editor = getEditor()
	const toasts = getToasts()
	const showDebugSdkToast = createLocalStorageState('showDebugSdkToast', true)

	const isDebugMode = fromComputed('isDebugMode', () => editor.getInstanceState().isDebugMode)

	$effect(() => {
		if (!isDebugMode.current) {
			toasts.removeToast(TOAST_ID)
			return
		}
		if (!showDebugSdkToast.current) return

		const timeout = setTimeout(() => {
			toasts.addToast({
				id: TOAST_ID,
				description: 'Want to build with svelte-draw?',
				keepOpen: true,
				actions: [
					{
						type: 'primary',
						label: 'Get started',
						onClick() {
							trackEvent('debug-sdk-toast-clicked')
							window.open(SDK_URL, '_blank')
						},
					},
				],
			})
			showDebugSdkToast.update(false)
		}, TOAST_DELAY)

		return () => clearTimeout(timeout)
	})
</script>
