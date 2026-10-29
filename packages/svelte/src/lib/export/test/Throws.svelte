<script lang="ts">
	const props: { label: string } = $props()
	$effect.pre(() => {
		throw new Error(`boom ${props.label}`)
	})
</script>
