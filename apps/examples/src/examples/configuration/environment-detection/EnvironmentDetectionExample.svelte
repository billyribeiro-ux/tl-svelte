<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './environment-detection.css'
	import EnvironmentInfo from './EnvironmentInfo.svelte'

	const components = {
		TopPanel: EnvironmentInfo,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
[1]
`tlenvReactive` is an atom, so read it through `fromComputed` (see EnvironmentInfo.svelte) to update
when it changes. On a touchscreen laptop `isCoarsePointer` flips as the user switches between
touching the screen and using the trackpad. `tlenv` is a plain object whose values are fixed at
load time, so it can be read directly.

[2]
Touch needs bigger targets than a mouse: 48px for a coarse pointer, 32px for a fine one.

[3]
`isIos` is checked before `isDarwin` because iPadOS reports itself as a Mac, so both are true on
an iPad.
-->
