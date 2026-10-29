<script lang="ts">
	import { cn } from '#utils/cn.js'
	import SvelteDrawLink from '#lib/components/common/SvelteDrawLink.svelte'
	import type { MdxAttributeValue, MdxElementNode, MdxNode } from '#lib/mdx/types.js'
	import {
		getCodeLinks,
		getFocusLines,
		hasCodeLinks,
		hasFocusLines,
		isIdentifier,
		tokenize,
	} from './code-context'
	import MdxNodes from './MdxNodes.svelte'

	let { nodes, ...rest }: { nodes: MdxNode[]; [attribute: string]: unknown } = $props()

	// Both are empty when no `<CodeLinks>` / `<FocusLines>` wraps the code.
	const codeLinks = hasCodeLinks() ? getCodeLinks() : {}
	const focusLines = hasFocusLines() ? getFocusLines() : null

	const blurredLineClassName = '[&_*]:!opacity-60 [&_*]:!text-white'

	function getLink(token: string): string | undefined {
		if (!isIdentifier(token)) return undefined
		return Object.hasOwn(codeLinks, token) ? codeLinks[token] : undefined
	}

	function isLine(node: MdxElementNode) {
		return node.n === 'span' && node.a?.class === 'line'
	}

	type CodeEntry =
		| { kind: 'text'; value: string }
		| { kind: 'line'; attrs: Record<string, MdxAttributeValue>; children: MdxNode[]; blurred: boolean }

	// Inline code (e.g. `code`) isn't highlighted, so its only child is a string.
	const inlineText = $derived(nodes.length === 1 && nodes[0].t === 'text' ? nodes[0].v : null)

	// Code highlighted by shikijs: children are spans, each a line containing token spans, with
	// whitespace text between the lines.
	const entries = $derived.by(() => {
		if (inlineText !== null) return []
		let lineNumber = 0
		const result: CodeEntry[] = []
		for (const node of nodes) {
			// ignore whitespace
			if (node.t === 'text') {
				result.push({ kind: 'text', value: node.v })
				continue
			}
			if (node.t !== 'el' || node.n !== 'span') throw new Error('Invalid code child (not a span)')
			if (!isLine(node)) throw new Error('Invalid code child (not a line)')
			// apply line lowlights
			lineNumber++
			result.push({
				kind: 'line',
				attrs: node.a ?? {},
				children: node.c ?? [],
				blurred: !!focusLines && !focusLines.includes(lineNumber),
			})
		}
		return result
	})
</script>

{#snippet linked(text: string)}
	{#each tokenize(text) as token, i (i)}
		{@const link = getLink(token)}
		{#if link}
			<SvelteDrawLink
				href={link}
				class="group-[.not-prose]:underline group-[.not-prose]:hover:no-underline decoration-[#667e8b]"
				>{token}</SvelteDrawLink
			>
		{:else}
			{token}
		{/if}
	{/each}
{/snippet}

{#if inlineText !== null}
	<code {...rest}>{@render linked(inlineText)}</code>
{:else}
	<code {...rest}>
		{#each entries as entry, i (i)}
			{#if entry.kind === 'text'}
				{entry.value}
			{:else}
				<span {...entry.attrs} class={cn(entry.attrs.class as string, entry.blurred && blurredLineClassName)}>
					<!-- inject links where needed -->
					{#each entry.children as child, j (j)}
						{#if child.t === 'el' && child.n === 'span' && child.c?.length === 1 && child.c[0].t === 'text'}
							<span {...child.a}>{@render linked(child.c[0].v)}</span>
						{:else}
							<MdxNodes nodes={[child]} />
						{/if}
					{/each}
				</span>
			{/if}
		{/each}
	</code>
{/if}
