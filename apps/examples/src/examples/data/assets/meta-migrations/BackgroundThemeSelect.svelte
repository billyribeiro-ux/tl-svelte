<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import type { PageMetaV2 } from './pageMeta'

	const editor = getEditor()
	const backgroundTheme = fromComputed(
		'background theme',
		() => (editor.getCurrentPage().meta as PageMetaV2).backgroundTheme
	)
</script>

<span style="pointer-events: all; padding: 5px 15px; margin: 10px; font-size: 18px">
	bg: &nbsp;
	<select
		value={backgroundTheme.current ?? 'none'}
		onchange={(e) => {
			const value = e.currentTarget.value
			editor.updatePage({
				id: editor.getCurrentPageId(),
				meta: value === 'none' ? {} : { backgroundTheme: value },
			})
		}}
	>
		<option value="none">None</option>
		<option value="red">Red</option>
		<option value="blue">Blue</option>
		<option value="green">Green</option>
	</select>
</span>
