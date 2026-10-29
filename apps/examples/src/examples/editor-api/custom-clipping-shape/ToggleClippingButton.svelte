<script lang="ts">
	import { fromSignal, getEditor, SvelteDrawUiButton } from 'svelte-draw'
	import { on } from 'svelte/events'
	import { isClippingEnabled$ } from './CircleClipShapeUtil'

	const editor = getEditor()

	const clippingEnabled = fromSignal(isClippingEnabled$)

	// Native listeners: Svelte delegates `onpointerdown`/`onpointerup` to the app root, which runs
	// after the editor container's listeners, too late for `markEventAsHandled` to take effect.
	const markHandled = (element: HTMLButtonElement) => {
		const offDown = on(element, 'pointerdown', editor.markEventAsHandled)
		const offUp = on(element, 'pointerup', editor.markEventAsHandled)
		return () => {
			offDown()
			offUp()
		}
	}
</script>

<div class="tlui-menu CustomClipping-toggle">
	<SvelteDrawUiButton
		type="normal"
		onclick={() => isClippingEnabled$.update((prev) => !prev)}
		{@attach markHandled}
	>
		{clippingEnabled.current ? '✂️ Disable clipping' : '○ Enable clipping'}
	</SvelteDrawUiButton>
</div>
