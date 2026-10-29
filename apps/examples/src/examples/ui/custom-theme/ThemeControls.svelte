<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiButtonLabel } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import ThemeSlider from './ThemeSlider.svelte'

	// [12]
	let {
		fontSize = $bindable(),
		lineHeight = $bindable(),
		strokeWidth = $bindable(),
		defaults,
	}: {
		fontSize: number
		lineHeight: number
		strokeWidth: number
		defaults: { fontSize: number; lineHeight: number; strokeWidth: number }
	} = $props()

	// The React original stopped pointerdown propagation. Svelte delegates `onpointerdown` to the
	// app root, which is too late to stop the editor container's native listener, so attach natively.
	const stopPointerDown: Attachment<HTMLElement> = (element) => {
		const handler = (e: PointerEvent) => e.stopPropagation()
		element.addEventListener('pointerdown', handler)
		return () => element.removeEventListener('pointerdown', handler)
	}
</script>

<div class="tlui-menu custom-theme-toolbar" {@attach stopPointerDown}>
	<ThemeSlider
		label="Font size"
		value={fontSize}
		onChange={(v) => (fontSize = v)}
		min={8}
		max={32}
		step={1}
		defaultValue={defaults.fontSize}
	/>
	<ThemeSlider
		label="Line height"
		value={lineHeight}
		onChange={(v) => (lineHeight = v)}
		min={1}
		max={2}
		step={0.05}
		defaultValue={defaults.lineHeight}
	/>
	<ThemeSlider
		label="Stroke width"
		value={strokeWidth}
		onChange={(v) => (strokeWidth = v)}
		min={0.5}
		max={6}
		step={0.25}
		defaultValue={defaults.strokeWidth}
	/>

	<SvelteDrawUiButton
		type="low"
		onclick={() => {
			fontSize = defaults.fontSize
			lineHeight = defaults.lineHeight
			strokeWidth = defaults.strokeWidth
		}}
	>
		<SvelteDrawUiButtonLabel>Reset to defaults</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
