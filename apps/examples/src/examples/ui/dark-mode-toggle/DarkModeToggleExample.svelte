<script lang="ts" module>
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import DarkModeButton from './DarkModeButton.svelte'

	// There's a guide in DarkModeButton.svelte!

	const components: TLComponents = {
		TopPanel: DarkModeButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
