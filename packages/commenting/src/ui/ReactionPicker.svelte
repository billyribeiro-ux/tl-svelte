<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsAddReaction: { id: 'comments.add-reaction', defaultMessage: 'Add reaction' },
	})
</script>

<script lang="ts">
	import {
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		tlmenus,
		tryGetEditor,
	} from 'svelte-draw'
	import EmojiPicker from './EmojiPicker.svelte'
	import SmileyIcon from './icons/SmileyIcon.svelte'
	import { isMultiSelectPick, type ReactionPickerProps } from './reaction-picker'

	/**
	 * The add-reaction affordance: a smiley button that opens an emoji grid.
	 *
	 * Anchored to its own button rather than to the reactions row, so the menu keeps its position as
	 * reactions are added and the row reflows.
	 *
	 * Picking an emoji dismisses the grid — adding and removing alike, since either way the picker has
	 * done its job — and hands focus back to the trigger. Shift-picking keeps the grid open, for
	 * choosing several reactions in a row.
	 * @public
	 */
	let {
		emoji,
		selected,
		onSelect,
		renderReaction,
		palette: Palette = EmojiPicker,
		menuId,
		class: className = 'tlui-cmt-thread__action',
	}: ReactionPickerProps = $props()

	const msg = getTranslation()
	const editor = tryGetEditor()
	// Unique per mounted picker unless the host supplies something stabler — see `menuId`.
	const generatedId = $props.id()
	const id = $derived(menuId ?? `comment-reactions-${generatedId}`)

	// The dropdown's open state lives in svelte-draw's global menu registry, so dropping the entry is
	// what closes it. The palette's tokens are plain buttons — a swappable component, not menu
	// items — so nothing dismisses the menu on its own.
	function handleSelect(value: string, event?: MouseEvent | KeyboardEvent) {
		onSelect?.(value)
		if (!isMultiSelectPick(event)) {
			tlmenus.deleteOpenMenu(id, editor?.contextId)
		}
	}
</script>

<SvelteDrawUiDropdownMenuRoot {id}>
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				tooltip={msg(messages.commentsAddReaction)}
				title={msg(messages.commentsAddReaction)}
				class={className}
			>
				<SmileyIcon />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<!-- left-aligned under the trigger, so the grid opens rightward off the card's edge -->
	<SvelteDrawUiDropdownMenuContent side="bottom" align="start" alignOffset={0} sideOffset={4}>
		<Palette {emoji} {selected} onSelect={handleSelect} {renderReaction} />
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
