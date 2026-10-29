<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import VerticalToolbar from './VerticalToolbar.svelte'

	const components: TLComponents = {
		Toolbar: VerticalToolbar,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
