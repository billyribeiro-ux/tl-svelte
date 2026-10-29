<script lang="ts">
	import { fromComputed, getEditor, type TLGeoShape } from 'svelte-draw'
	import { SOFT_CLIP_META_KEY } from './softClip'

	let {
		opacity,
		onOpacityChange,
	}: {
		opacity: number
		onOpacityChange(value: number): void
	} = $props()

	const editor = getEditor()
	const selectedGeoShapes = fromComputed('selected geo shapes', () =>
		editor.getSelectedShapes().filter((s): s is TLGeoShape => s.type === 'geo')
	)

	const allMarked = $derived(
		selectedGeoShapes.current.length > 0 &&
			selectedGeoShapes.current.every((s) => s.meta?.[SOFT_CLIP_META_KEY] === true)
	)
</script>

<div class="soft-clip-controls">
	<label class="soft-clip-slider">
		<span>Opacity</span>
		<input
			type="range"
			min={0}
			max={100}
			value={Math.round(opacity * 100)}
			oninput={(e) => onOpacityChange(Number(e.currentTarget.value) / 100)}
		/>
		<span class="soft-clip-slider-value">{Math.round(opacity * 100)}%</span>
	</label>
	{#if selectedGeoShapes.current.length > 0}
		<button
			onclick={() => {
				editor.updateShapes(
					selectedGeoShapes.current.map((s) => ({
						id: s.id,
						type: s.type,
						meta: { ...s.meta, [SOFT_CLIP_META_KEY]: !allMarked },
					}))
				)
			}}
		>
			{allMarked ? 'Disable soft clip' : 'Enable soft clip'}
		</button>
	{/if}
</div>
