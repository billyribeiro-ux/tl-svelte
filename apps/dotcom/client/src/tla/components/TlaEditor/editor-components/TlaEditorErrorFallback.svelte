<script lang="ts">
	import type { TLErrorFallbackProps } from 'svelte-draw'

	let { error }: TLErrorFallbackProps = $props()

	function rethrow(): never {
		throw error
	}

	// Rethrow so the route's error boundary renders the error page instead of the editor's own fallback.
	rethrow()
</script>
