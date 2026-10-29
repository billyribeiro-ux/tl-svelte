<script lang="ts">
	import { SvelteDraw, type Editor, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import MetaUiHelper from './MetaUiHelper.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: MetaUiHelper,
	}

	function handleMount(editor: Editor) {
		// [3]
		editor.getInitialMetaForShape = (_shape) => {
			return {
				createdBy: editor.user.getExternalId(),
				createdAt: Date.now(),
			}
		}
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="meta-on-create-example" {components} onMount={handleMount} />
</div>

<!--
Every shape has a `meta` property for your own JSON data. svelte-draw stores and syncs it but never
reads it. This example records who created each shape and when. See the shapes docs for more on
meta: https://svelte-draw.invalid/docs/shapes#meta

[1]
A shape's `meta` is typed as `JsonObject`. To get useful types for your own fields, intersect
the shape type with the shape of your meta (see MetaUiHelper.svelte).

[2]
Reading `editor.getOnlySelectedShape()` inside `fromComputed` updates the panel whenever the
selection changes.

[3]
`getInitialMetaForShape` is called by `createShapes` for every new shape. Its result is merged
with any `meta` passed to `createShapes`, with the explicit meta winning. It's a plain method on
the editor, so the simplest way to customize it is to replace it in `onMount`. The shape is
passed in, so you can return different meta for different shape types.
-->
