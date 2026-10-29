<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsHide: { id: 'comments.hide', defaultMessage: 'Hide comments' },
		commentsShow: { id: 'comments.show', defaultMessage: 'Show comments' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor, getTranslation, SvelteDrawUiButton } from 'svelte-draw'
	import EyeClosedIcon from '../ui/icons/EyeClosedIcon.svelte'
	import EyeOpenIcon from '../ui/icons/EyeOpenIcon.svelte'
	import { commentsHidden, toggleCommentsHidden } from './state'

	/** The sidebar header's show/hide toggle for comment pins — an eye that closes while comments
	 *  are hidden. The same state as the Shift+C shortcut.
	 * @public */
	const editor = getEditor()
	const msg = getTranslation()
	const hidden = fromComputed('comments hidden', () => commentsHidden.get(editor))
	const label = $derived(hidden.current ? msg(messages.commentsShow) : msg(messages.commentsHide))
</script>

<SvelteDrawUiButton
	type="icon"
	tooltip={label}
	title={label}
	class="tlui-cmt-header-btn"
	onclick={() => toggleCommentsHidden(editor)}
>
	{#if hidden.current}<EyeClosedIcon />{:else}<EyeOpenIcon />{/if}
</SvelteDrawUiButton>
