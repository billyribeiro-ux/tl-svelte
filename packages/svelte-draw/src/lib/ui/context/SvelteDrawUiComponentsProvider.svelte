<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createUiComponents, setUiComponents, type TLUiComponents } from './components'

	let { overrides = {}, children }: { overrides?: TLUiComponents; children: Snippet } = $props()

	setUiComponents(createUiComponents(() => overrides))
</script>

{@render children()}
