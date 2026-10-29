<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsMoreOptions: { id: 'comments.more-options', defaultMessage: 'More options' },
		commentsHide: { id: 'comments.hide', defaultMessage: 'Hide comments' },
		commentsShow: { id: 'comments.show', defaultMessage: 'Show comments' },
	})

	// A keyboard-shortcut glyph, not translatable copy — kept out of the markup as a constant.
	const HIDE_SHORTCUT = '⇧C'
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import {
		fromComputed,
		getEditor,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuGroup,
		SvelteDrawUiDropdownMenuItem,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiIcon,
	} from 'svelte-draw'
	import { commentsHidden, toggleCommentsHidden } from './state'

	/** The overflow (⋯) dropdown in the sidebar header. For now it holds the hide/show-comments
	 *  toggle; it's the home for later comment-wide controls (notifications, mark all as read).
	 * @public */
	const editor = getEditor()
	const msg = getTranslation()
	const hidden = fromComputed('comments hidden', () => commentsHidden.get(editor))
</script>

<SvelteDrawUiDropdownMenuRoot id="comments-overflow">
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				tooltip={msg(messages.commentsMoreOptions)}
				title={msg(messages.commentsMoreOptions)}
				class="tlui-cmt-header-btn"
			>
				<SvelteDrawUiIcon icon="dots-vertical" label={msg(messages.commentsMoreOptions)} small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent
		class="tlui-cmt-menu"
		side="bottom"
		align="end"
		alignOffset={0}
		sideOffset={4}
	>
		<SvelteDrawUiDropdownMenuGroup>
			<SvelteDrawUiDropdownMenuItem>
				{#snippet child({ props })}
					<button
						{...mergeProps(props, { onclick: () => toggleCommentsHidden(editor) })}
						type="button"
						class="tlui-cmt-menu-item"
					>
						<span>{hidden.current ? msg(messages.commentsShow) : msg(messages.commentsHide)}</span>
						<span class="tlui-cmt-menu-item__shortcut">{HIDE_SHORTCUT}</span>
					</button>
				{/snippet}
			</SvelteDrawUiDropdownMenuItem>
		</SvelteDrawUiDropdownMenuGroup>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
