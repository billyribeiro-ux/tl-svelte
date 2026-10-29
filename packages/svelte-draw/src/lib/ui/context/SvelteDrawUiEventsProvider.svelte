<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setUiEvents, type TLUiEventHandler } from './events'

	let { onEvent, children }: { onEvent?: TLUiEventHandler; children: Snippet } = $props()

	setUiEvents({
		get current() {
			return onEvent ?? (() => void null)
		},
	})
</script>

{@render children()}
