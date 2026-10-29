<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsTitle: { id: 'comments.title', defaultMessage: 'Comments' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor, SvelteDrawUiMenuCheckboxItem } from 'svelte-draw'
	import { commentsHidden, toggleCommentsHidden } from './state'

	/**
	 * A checkbox menu item for a "View" menu that shows/hides comment pins on the canvas — checked
	 * when comments are visible, like svelte-draw's own grid/snap toggles. Reads and toggles the shared
	 * {@link commentsHidden} signal, so it stays in sync with the Shift+C shortcut and the sidebar
	 * control. Drop it into whichever menu your app owns.
	 * @public
	 */
	const editor = getEditor()
	const hidden = fromComputed('comments hidden', () => commentsHidden.get(editor))
</script>

<SvelteDrawUiMenuCheckboxItem
	id="comments-visible"
	label={messages.commentsTitle.id}
	kbd="!c"
	readonlyOk
	checked={!hidden.current}
	onSelect={() => toggleCommentsHidden(editor)}
/>
