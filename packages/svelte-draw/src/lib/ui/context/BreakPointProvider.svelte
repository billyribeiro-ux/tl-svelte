<script lang="ts">
	import { getGlobalWindow } from '@svelte-draw/editor'
	import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'
	import type { Snippet } from 'svelte'
	import { computeBreakpoint, setBreakpoint } from './breakpoints'

	let { forceMobile = false, children }: { forceMobile?: boolean; children: Snippet } = $props()

	// To allow mounting the sidebar without an editor running, this uses the 'maybe' editor.
	const editor = tryGetEditor()

	// This will recompute when the viewport screen bounds change...
	const width = fromComputed(
		'breakpoint width',
		() => editor?.getViewportScreenBounds().width ?? getGlobalWindow().innerWidth
	)
	const breakpoint = $derived(computeBreakpoint(width.current, forceMobile))

	setBreakpoint({
		get current() {
			return breakpoint
		},
	})
</script>

{@render children()}
