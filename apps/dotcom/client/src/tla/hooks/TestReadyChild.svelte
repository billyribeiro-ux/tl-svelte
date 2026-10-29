<script lang="ts">
	import { getIsReady, getSetIsReady } from './useIsReady.svelte'
	const ready = getIsReady()
	const setReady = getSetIsReady()
</script>

<button onclick={setReady}>ready: {ready.current}</button>
