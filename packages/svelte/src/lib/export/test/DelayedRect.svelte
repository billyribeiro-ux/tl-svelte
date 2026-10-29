<svelte:options namespace="svg" />

<script lang="ts">
	import { delaySvgExport } from '../context'

	let { w, h }: { w: number; h: number } = $props()
	let loaded = $state(false)
	const ready = delaySvgExport()

	$effect(() => {
		const t = setTimeout(() => {
			loaded = true
			ready()
		}, 20)
		return () => clearTimeout(t)
	})
</script>

<rect width={w} height={h} fill={loaded ? 'green' : 'gray'} data-testid="delayed-rect" />
