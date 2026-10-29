<script lang="ts">
	let { label, zoom, boom = false }: { label: string; zoom?: number; boom?: boolean } = $props()

	// Fails during render, like a shape whose view throws.
	// svelte-ignore state_referenced_locally
	if (boom) throw new Error('boom from TestShapeBody')
</script>

<span data-testid="shape-body" data-zoom={zoom}>{label}</span>
