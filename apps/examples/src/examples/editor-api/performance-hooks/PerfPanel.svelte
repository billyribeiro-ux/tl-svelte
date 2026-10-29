<script lang="ts">
	import {
		getEditor,
		PerformanceApiAdapter,
		type TLCameraEndPerfEvent,
		type TLInteractionEndPerfEvent,
		type TLPerfFrameTimeStats,
	} from 'svelte-draw'

	type LastEvent =
		| { kind: 'interaction'; event: TLInteractionEndPerfEvent }
		| { kind: 'camera'; event: TLCameraEndPerfEvent }

	// [1]
	const editor = getEditor()
	let last = $state.raw<LastEvent | null>(null)

	$effect(() => {
		// [2]
		const unsubs = [
			editor.performance.on('interaction-end', (event) => {
				last = { kind: 'interaction', event }
			}),
			editor.performance.on('camera-end', (event) => {
				last = { kind: 'camera', event }
			}),
		]

		// [3]
		const adapter = new PerformanceApiAdapter(editor.performance)

		return () => {
			unsubs.forEach((unsub) => unsub())
			adapter.dispose()
		}
	})
</script>

{#snippet frameTimeStats(event: TLPerfFrameTimeStats)}
	<div class="perf-section">
		<div class="perf-section-title">Frame times</div>
		<div class="perf-row">
			<span class="perf-label">Duration</span>
			<span class="perf-value">{event.duration.toFixed(0)}ms</span>
		</div>
		<div class="perf-row">
			<span class="perf-label">FPS</span>
			<span class="perf-value">{event.fps.toFixed(1)}</span>
		</div>
		<div class="perf-row">
			<span class="perf-label">Frames</span>
			<span class="perf-value">{event.frameCount}</span>
		</div>
		<div class="perf-row">
			<span class="perf-label">Avg</span>
			<span class="perf-value">{event.avgFrameTime.toFixed(1)}ms</span>
		</div>
		<div class="perf-row">
			<span class="perf-label">p95</span>
			<span class="perf-value">{event.p95FrameTime.toFixed(1)}ms</span>
		</div>
	</div>
{/snippet}

<div class="perf-panel">
	{#if last}
		<div class="perf-section">
			<div class="perf-section-title">
				{last.kind === 'interaction'
					? `Interaction: ${last.event.name}`
					: `Camera: ${last.event.type}`}
			</div>
		</div>
		{@render frameTimeStats(last.event)}
		{#if last.kind === 'interaction'}
			<div class="perf-section">
				<div class="perf-section-title">Context</div>
				{#each Object.entries(last.event.selectedShapeTypes) as [type, count] (type)}
					<div class="perf-row">
						<span class="perf-label">{type}</span>
						<span class="perf-value">{count}</span>
					</div>
				{/each}
				<div class="perf-row">
					<span class="perf-label">All shapes</span>
					<span class="perf-value">{last.event.shapeCount}</span>
				</div>
				<div class="perf-row">
					<span class="perf-label">Zoom</span>
					<span class="perf-value">{(last.event.zoomLevel * 100).toFixed(0)}%</span>
				</div>
			</div>
		{:else}
			<div class="perf-section">
				<div class="perf-row">
					<span class="perf-label">Visible shapes</span>
					<span class="perf-value">{last.event.visibleShapeCount}</span>
				</div>
				<div class="perf-row">
					<span class="perf-label">Culled shapes</span>
					<span class="perf-value">{last.event.culledShapeCount}</span>
				</div>
				<div class="perf-row">
					<span class="perf-label">Zoom</span>
					<span class="perf-value">{(last.event.zoomLevel * 100).toFixed(0)}%</span>
				</div>
			</div>
		{/if}
	{:else}
		<div class="perf-hint">Drag a shape or pan the canvas to see performance stats</div>
	{/if}
</div>
