<script lang="ts">
	import type { TLErrorFallbackProps } from 'svelte-draw'

	let { error }: TLErrorFallbackProps = $props()

	// Let the route's error page handle it.
	// svelte-ignore state_referenced_locally
	throw error
</script>
