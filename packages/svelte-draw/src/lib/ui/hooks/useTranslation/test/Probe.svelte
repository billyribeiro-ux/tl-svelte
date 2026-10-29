<script lang="ts">
	let { run }: { run: () => void } = $props()
	// svelte-ignore state_referenced_locally
	run()
</script>
