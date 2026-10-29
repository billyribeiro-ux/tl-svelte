<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fromComputed } from 'svelte-draw'
	import { setupUITheme } from '../hooks/useUITheme.svelte'
	import { getLocalSessionState } from '../utils/local-session-state'

	let {
		onThemeChange,
		children,
	}: { onThemeChange(theme: 'light' | 'dark' | 'system'): void; children: Snippet } = $props()

	const theme = fromComputed('theme', () => getLocalSessionState().theme)
	setupUITheme()

	$effect(() => {
		onThemeChange(theme.current)
	})
</script>

{@render children()}
