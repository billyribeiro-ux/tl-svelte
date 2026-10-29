<script lang="ts">
	import { Vec, fromComputed, getEditor } from 'svelte-draw'
	import { MARKER_TYPE } from './marker'

	const editor = getEditor()

	// [5]
	const markersQuery = editor.store.query.records(MARKER_TYPE)
	const markers = fromComputed('markers on screen', () =>
		markersQuery.get().map((marker) => ({
			marker,
			screenPoint: editor.pageToViewport(new Vec(marker.x, marker.y)),
		}))
	)

	// Svelte delegates `onpointerdown`, so it would run after the editor's native listeners and
	// `stopPropagation` would be too late; listen natively instead.
	function markerEvents(id: (typeof markers.current)[number]['marker']['id']) {
		return (element: HTMLElement) => {
			function onPointerDown(e: PointerEvent) {
				e.stopPropagation()
				if (e.button === 2 || e.ctrlKey) {
					editor.store.remove([id])
				}
			}
			element.addEventListener('pointerdown', onPointerDown)
			return () => element.removeEventListener('pointerdown', onPointerDown)
		}
	}
</script>

{#each markers.current as { marker, screenPoint } (marker.id)}
	<div
		class="custom-records-marker"
		style:left="{screenPoint.x}px"
		style:top="{screenPoint.y}px"
		title={marker.label}
		{@attach markerEvents(marker.id)}
	>
		<span class="custom-records-marker__icon">{marker.icon}</span>
		<span class="custom-records-marker__label">{marker.label}</span>
	</div>
{/each}
