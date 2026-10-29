<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setupTools } from '../hooks/useTools.svelte'
	import { createMergedOverrides, type TLUiOverrides } from '../overrides.svelte'
	import { createActions, setActions } from './actions.svelte'

	let {
		overrides,
		children,
	}: { overrides?: TLUiOverrides | TLUiOverrides[]; children?: Snippet } = $props()

	// The React version nested <ActionsProvider> > <ToolsProvider>; both only set context, so they
	// are set side by side here.
	const mergedOverrides = createMergedOverrides(() => overrides)
	setActions(createActions(() => mergedOverrides.current.actions))
	setupTools(() => mergedOverrides.current.tools)
</script>

{@render children?.()}
