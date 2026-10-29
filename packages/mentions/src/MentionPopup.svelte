<script lang="ts">
	import type { Editor } from '@svelte-draw/editor'
	import { setContainer, setEditor, usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import type { Snippet } from 'svelte'
	import MentionList from './MentionList.svelte'
	import type { MentionMember } from './types'

	/** The live @-picker popup: owns the highlighted index and keyboard, renders the presentational list. */
	let {
		items,
		command,
		renderMember,
		editor,
		container,
	}: {
		items: MentionMember[]
		command(attrs: { id: string; label: string }): void
		renderMember?: Snippet<[MentionMember]>
		/** The svelte-draw editor the composer lives in, for locale and wheel pass-through. */
		editor?: Editor | null
		/** The `.tl-container` the popup is mounted in. Without one there is no canvas to pass wheels to. */
		container?: HTMLElement | null
	} = $props()

	// The suggestion plugin mounts this imperatively, outside the editor's component tree, so the
	// editor and container contexts that `MentionList` and the wheel pass-through read are
	// re-provided here. Props are read once on purpose: the context is fixed for the popup's life.
	/* svelte-ignore state_referenced_locally */
	if (editor) setEditor(editor)
	/* svelte-ignore state_referenced_locally */
	if (editor && container) setContainer(container)
	// A wheel over the popup drives the canvas beneath it, the same pass-through every svelte-draw
	// panel gets; the attachment leaves the list alone while it scrolls its own overflow.
	/* svelte-ignore state_referenced_locally */
	const passThrough = editor && container ? usePassThroughWheelEvents() : undefined

	// A new query yields new items, which resets the highlight to the top. A derived value rather
	// than an effect: an effect would leave a moment where `activeIndex` still points past a shrunk
	// list and Enter selects its (now out-of-range, undefined) item, swallowing the key without
	// inserting a mention. A derived is re-read synchronously, so it is never stale.
	let activeIndex = $derived.by(() => {
		void items
		return 0
	})

	function select(member: MentionMember | undefined) {
		if (member) command({ id: member.id, label: member.name })
	}

	/** Called by the suggestion plugin to forward navigation keys into the popup. */
	export function onKeyDown({ event }: { event: KeyboardEvent }): boolean {
		if (items.length === 0) return false
		if (event.key === 'ArrowUp') {
			activeIndex = (activeIndex + items.length - 1) % items.length
			return true
		}
		if (event.key === 'ArrowDown') {
			activeIndex = (activeIndex + 1) % items.length
			return true
		}
		// Enter and Tab both complete the highlighted member (falling back to the top match so a
		// stale index never selects `undefined`). The empty-roster case is handled a level up, in
		// the suggestion's onKeyDown, which cancels the picker.
		if (event.key === 'Enter' || event.key === 'Tab') {
			select(items[activeIndex] ?? items[0])
			return true
		}
		return false
	}
</script>

<MentionList
	{@attach passThrough}
	members={items}
	{activeIndex}
	onSelect={select}
	{renderMember}
/>
