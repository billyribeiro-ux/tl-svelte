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
				updatedBy: editor.user.getExternalId(),
				updatedAt: Date.now(),
			}
		}
		// [4]
		editor.sideEffects.registerBeforeChangeHandler('shape', (_prev, next, source) => {
			if (source !== 'user') return next
			return {
				...next,
				meta: {
					updatedBy: editor.user.getExternalId(),
					updatedAt: Date.now(),
				},
			}
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="svelteDraw_change_meta_example" {components} onMount={handleMount} />
</div>

<!--
Every shape has a `meta` property for your own JSON data. svelte-draw stores and syncs it but never
reads it. This example stamps `updatedBy` and `updatedAt` on shapes as they change. See the
shapes docs for more on meta: https://svelte-draw.invalid/docs/shapes#meta

[1]
A shape's `meta` is typed as `JsonObject`. To get useful types for your own fields, intersect
the shape type with the shape of your meta (see MetaUiHelper.svelte).

[2]
Reading `editor.getOnlySelectedShape()` inside `fromComputed` updates the panel whenever the
selection changes or the selected shape's record changes, which is what makes the meta update
live as you drag.

[3]
`getInitialMetaForShape` is called by `createShapes` for every new shape, and its result is
merged with any `meta` you passed. Replacing it here means new shapes start out with the same
fields the change handler maintains.

[4]
A before-change side effect can return a modified record to be written in place of `next`.
Filtering on `source === 'user'` skips changes that arrived from a remote peer, so in a
multiplayer document you don't overwrite the real author with the local user.
-->
