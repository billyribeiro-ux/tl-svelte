<script lang="ts" module>
	// HTML void elements cannot have children (`<svelte:element>` throws in dev if they do).
	const VOID_ELEMENTS = new Set([
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr',
	])
</script>

<script lang="ts">
	import type { Component } from 'svelte'
	import type { MdxNode } from '#lib/mdx/types.js'
	import { htmlOverrides, mdxComponents } from './components'
	import Self from './MdxNodes.svelte'

	let { nodes }: { nodes: MdxNode[] } = $props()
</script>

<!-- Renders the tree `compileMdx` produces; the counterpart of next-mdx-remote's `components` map. -->
{#each nodes as node, i (i)}
	{#if node.t === 'text'}
		{node.v}
	{:else if node.t === 'cmp'}
		{@const Cmp = mdxComponents[node.n as keyof typeof mdxComponents] as Component<any>}
		<Cmp {...node.p}>
			{#snippet children()}
				<Self nodes={node.c ?? []} />
			{/snippet}
		</Cmp>
	{:else if node.n === 'code'}
		{@const Code = htmlOverrides.code as Component<any>}
		<Code {...node.a} nodes={node.c ?? []} />
	{:else if node.n in htmlOverrides && VOID_ELEMENTS.has(node.n)}
		{@const VoidOverride = htmlOverrides[node.n as keyof typeof htmlOverrides] as Component<any>}
		<VoidOverride {...node.a} />
	{:else if node.n in htmlOverrides}
		{@const Override = htmlOverrides[node.n as keyof typeof htmlOverrides] as Component<any>}
		<Override {...node.a}>
			{#snippet children()}
				<Self nodes={node.c ?? []} />
			{/snippet}
		</Override>
	{:else if VOID_ELEMENTS.has(node.n)}
		<svelte:element this={node.n} {...node.a} />
	{:else}
		<svelte:element this={node.n} {...node.a}>
			<Self nodes={node.c ?? []} />
		</svelte:element>
	{/if}
{/each}
