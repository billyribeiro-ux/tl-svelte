<script lang="ts" module>
	import type { CommentAuthor } from '@svelte-draw/mentions'

	/** @public */
	export interface BylineProps {
		author: CommentAuthor
		/** ISO datetime; formatted to relative time by the component. */
		date: string
		/** Shows an "edited" marker when the comment has been edited. */
		edited?: boolean
	}
</script>

<script lang="ts">
	import { Avatar } from '@svelte-draw/mentions'
	import { getCurrentTranslation, SvelteDrawUiTooltip } from 'svelte-draw'
	import { formatFullDateTime, formatRelativeTime } from './format-time'

	/**
	 * A comment's metadata line: author name, relative time, and an edited marker. Hovering the time
	 * shows the full date and time in a tooltip.
	 * @public
	 */
	let { author, date, edited }: BylineProps = $props()

	// The relative time is the one piece of a byline that isn't the host's data, so it follows the
	// same translation context as every other string in the UI rather than a prop of its own.
	const translation = getCurrentTranslation()
</script>

<div class="tlui-cmt-head">
	<Avatar {author} />
	<span class="tlui-cmt-author">{author.name}</span>
	<SvelteDrawUiTooltip content={formatFullDateTime(date, translation.locale)}>
		{#snippet child({ props })}
			<span {...props} class="tlui-cmt-time">{formatRelativeTime(date, translation.locale)}{#if edited}<span class="tlui-cmt-edited">{' · edited'}</span>{/if}</span>
		{/snippet}
	</SvelteDrawUiTooltip>
</div>
