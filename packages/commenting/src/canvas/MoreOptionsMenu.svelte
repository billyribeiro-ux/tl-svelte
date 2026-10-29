<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsMoreOptions: { id: 'comments.more-options', defaultMessage: 'More options' },
	})
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuGroup,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiIcon,
	} from 'svelte-draw'

	/** The "⋯" dropdown used for both a comment's and the thread's actions. */
	let {
		id,
		moreFor,
		children,
	}: {
		id: string
		/** The comment whose ⋯ button this is, so `startEdit` can find it again to return focus. */
		moreFor?: string
		children: Snippet
	} = $props()

	const msg = getTranslation()
</script>

<SvelteDrawUiDropdownMenuRoot {id}>
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				tooltip={msg(messages.commentsMoreOptions)}
				title={msg(messages.commentsMoreOptions)}
				class="tlui-cmt-thread__action"
				data-cmt-more-for={moreFor}
			>
				<SvelteDrawUiIcon icon="dots-vertical" label={msg(messages.commentsMoreOptions)} small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent
		class="tlui-cmt-menu"
		side="bottom"
		align="start"
		alignOffset={0}
		sideOffset={4}
	>
		<SvelteDrawUiDropdownMenuGroup>{@render children()}</SvelteDrawUiDropdownMenuGroup>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
