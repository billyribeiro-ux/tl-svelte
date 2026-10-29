<script lang="ts">
	import type { ShapeView } from '@svelte-draw/editor'
	import type { Component } from 'svelte'

	/**
	 * Renders a {@link ShapeView} (`{ component, props }`), the value `ShapeUtil.component()` returns
	 * instead of JSX. A null/undefined view renders nothing (e.g. an absent `backgroundComponent`).
	 */
	let { view }: { view: ShapeView<any> | null | undefined } = $props()
</script>

{#if view}
	{@const Rendered = view.component as Component<any>}
	{#if Rendered}
		<Rendered {...view.props} />
	{/if}
{/if}
