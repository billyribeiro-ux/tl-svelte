<script lang="ts">
	// Rethrows during render so the nearest error boundary shows its fallback.
	let { error }: { error: unknown } = $props()

	// svelte-ignore state_referenced_locally
	throw error
</script>
