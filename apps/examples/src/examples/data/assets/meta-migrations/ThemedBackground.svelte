<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import type { PageMetaV2 } from './pageMeta'

	const editor = getEditor()
	const backgroundTheme = fromComputed(
		'background theme',
		() => (editor.getCurrentPage().meta as PageMetaV2).backgroundTheme
	)
</script>

<!-- [1] -->
<div class="tl-background" style:background-color={backgroundTheme.current}></div>

<!--
[1]
Rather than reaching into the DOM to recolor the default background, override the
`Background` component slot. `fromComputed` re-runs when the current page or its meta
changes, so switching pages updates the color too.
-->
