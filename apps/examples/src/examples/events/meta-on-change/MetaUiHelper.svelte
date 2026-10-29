<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import type { TLShape } from 'svelte-draw'

	// [1]
	type ShapeWithMyMeta = TLShape & { meta: Record<string, string | number> }

	const editor = getEditor()
	// [2]
	const onlySelectedShape = fromComputed(
		'only selected shape',
		() => editor.getOnlySelectedShape() as ShapeWithMyMeta | null
	)
</script>

<pre class="tlui-menu" style="margin: 0; padding: 8px">{onlySelectedShape.current
		? JSON.stringify(onlySelectedShape.current.meta, null, '\t')
		: 'Select one shape to see its meta data.'}</pre>
