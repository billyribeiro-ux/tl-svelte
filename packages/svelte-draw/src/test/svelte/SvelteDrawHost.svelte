<script lang="ts">
	/**
	 * Renders `<SvelteDraw>` with an optional child component inside the editor and UI context (the
	 * equivalent of passing JSX children to the React component). Tests only.
	 */
	import type { Component } from 'svelte'
	import SvelteDraw, { type SvelteDrawProps } from '../../lib/SvelteDraw.svelte'

	let {
		drawProps,
		child: Child,
		childProps = {},
	}: {
		drawProps: SvelteDrawProps
		child?: Component<any>
		childProps?: Record<string, unknown>
	} = $props()
</script>

<SvelteDraw {...drawProps}>
	{#if Child}
		<Child {...childProps} />
	{/if}
</SvelteDraw>
