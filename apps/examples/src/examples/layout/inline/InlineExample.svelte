<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const sizes = [
		{ width: 400, height: 300 },
		{ width: 500, height: 300 },
		{ width: 600, height: 400 },
		{ width: 700, height: 500 },
		{ width: 900, height: 600 },
	]
</script>

{#each sizes as { width, height } (`${width} x ${height}`)}
	<section style="padding: 12px 32px;">
		<h2>{width} x {height}</h2>
		<div style="width: {width}px; height: {height}px;">
			<SvelteDraw persistenceKey="inset-size-example" />
		</div>
	</section>
{/each}
