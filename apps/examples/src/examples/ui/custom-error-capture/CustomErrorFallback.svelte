<script lang="ts">
	import { getErrorAnnotations, type TLErrorFallbackProps } from 'svelte-draw'

	let { error }: TLErrorFallbackProps = $props()

	// [3]
	const annotations = $derived(error instanceof Error ? getErrorAnnotations(error) : null)
</script>

<div class="custom-error">
	<h1>Something went wrong</h1>
	<div>{error instanceof Error ? error.message : String(error)}</div>

	<!-- [4] -->
	{#if annotations}
		<pre class="custom-error__annotations">{JSON.stringify(annotations, null, 2)}</pre>
	{/if}

	<button onclick={() => window.location.reload()}>Refresh</button>
</div>
