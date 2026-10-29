<script lang="ts">
	import { Box, SvelteDrawUiButton, SvelteDrawUiButtonLabel, SvelteDrawUiButtonIcon, Vec } from 'svelte-draw'
	import { getEditor, fromComputed } from '@svelte-draw/svelte'
	import type { SvelteDrawAgent } from '../agent/SvelteDrawAgent'

	/**
	 * A button that zooms the viewport to show where an agent is working.
	 */
	let { agent }: { agent: SvelteDrawAgent } = $props()

	const editor = getEditor()

	// The signal reads are inside the computed callbacks (not in the template) so they are tracked.
	// `agent` is stable for the lifetime of this component: the parent keys the list by agent id.
	const currentRequest = fromComputed('activeRequest', () => agent.requests.getActiveRequest())
	const agentViewport = $derived(currentRequest.current?.bounds)

	// We only show the button if the agent is offscreen
	const agentIsOffscreen = fromComputed('agentIsOffscreen', () => {
		const viewport = agent.requests.getActiveRequest()?.bounds
		if (!viewport) return false
		const screenBounds = editor.getViewportScreenBounds()
		const agentViewportScreenCorners = Box.From(viewport).corners.map((corner) =>
			editor.pageToViewport(corner)
		)

		return !Box.FromPoints(agentViewportScreenCorners).collides(screenBounds)
	})

	// The button's arrow points towards the agent
	const angleToAgent = fromComputed('angleToAgent', () => {
		const viewport = agent.requests.getActiveRequest()?.bounds
		if (!viewport) return
		if (agentIsOffscreen.current) return

		const agentCenter = Box.From(viewport).center
		const agentScreenCenter = editor.pageToViewport(agentCenter)
		const screenBounds = editor.getViewportScreenBounds()
		const screenCenter = Box.From(screenBounds).center
		const displacement = Vec.From(agentScreenCenter).sub(screenCenter)
		return Math.atan2(displacement.y, displacement.x) * (180 / Math.PI)
	})

	function handleClick() {
		if (agentViewport) {
			const bounds = Box.From(agentViewport).expandBy(50)
			editor.zoomToBounds(bounds, { animation: { duration: 220 } })
		}
	}
</script>

{#snippet arrowIcon({ props }: { props: Record<string, unknown> })}
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		{...props}
		style:transform={`rotate(${angleToAgent.current}deg)`}
		style:transition="transform 0.2s ease"
	>
		<path
			d="M8 6l6 6-6 6"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
		/>
	</svg>
{/snippet}

{#if agentViewport && agentIsOffscreen.current}
	<SvelteDrawUiButton type="low" onclick={handleClick}>
		<div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">
			<SvelteDrawUiButtonIcon icon={arrowIcon} />
			<SvelteDrawUiButtonLabel>Go to {agent.id}</SvelteDrawUiButtonLabel>
		</div>
	</SvelteDrawUiButton>
{/if}
