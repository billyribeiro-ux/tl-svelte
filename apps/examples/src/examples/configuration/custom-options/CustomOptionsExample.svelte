<script lang="ts">
	import { SvelteDraw, type SvelteDrawOptions } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const options: Partial<SvelteDrawOptions> = {
		maxPages: 3,
		animationMediumMs: 5000,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="custom-options-example" {options} />
</div>
