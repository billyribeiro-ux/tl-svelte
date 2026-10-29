<script lang="ts">
	/** Runs a `use*` hook during component initialisation and exposes its live value. Tests only. */
	let { use, sink }: { use: () => unknown; sink: { read?(): unknown } } = $props()

	// The hook is fixed for the lifetime of one probe.
	// svelte-ignore state_referenced_locally
	const value = use() as { readonly current: unknown }
	// svelte-ignore state_referenced_locally
	sink.read = () => value.current
</script>
