<script lang="ts">
	import {
		Avatar,
		createMentionExtension,
		createMentionSuggestion,
		isMentionPickerOpen,
		type MentionMember,
	} from '@svelte-draw/mentions'
	import { Editor as TextEditor, type JSONContent } from '@tiptap/core'
	import { untrack } from 'svelte'
	import { isEqual, tryGetEditor, type TLRichText } from 'svelte-draw'
	import type { CommentComposerProps } from './comment-composer'
	import { commentTipTapExtensions, EMPTY_COMMENT, isCommentEmpty } from './comment-extensions'
	import { focusOnGestureEnd } from './gesture-focus'
	import SendButton from './SendButton.svelte'

	/**
	 * The input for writing a comment: a TipTap rich-text editor restricted to the comment extension
	 * set (bold, italic, lists, links, code, highlight — no headings), with a Send button. Formatting
	 * is applied through markdown and keyboard shortcuts (e.g. `**bold**`, `- `, Cmd+B); there's no
	 * floating toolbar. Presentational by default; pass value/onChange/onSubmit to drive it as a form.
	 * @public
	 */
	let {
		author,
		placeholder,
		value,
		onChange,
		onSubmit,
		sendLabel = 'Send',
		onArrowUpWhenEmpty,
		disabled,
		autoFocus,
		leading,
		getMentionSuggestions,
		renderMentionSuggestion,
	}: CommentComposerProps = $props()

	const interactive = $derived(!!onChange || !!onSubmit)
	// Lets the mention popup track the camera. Null outside a svelte-draw editor.
	const tlEditor = tryGetEditor()

	// svelte-ignore state_referenced_locally
	let isEmpty = $state(!value || isCommentEmpty(value))
	// Whether the field has grown to two rows: input across the full width, send button below.
	// Flips when the (single-line) content width reaches the space left beside the send button.
	let expanded = $state(false)
	let inputWrap = $state.raw<HTMLDivElement | null>(null)
	let mirror = $state.raw<HTMLDivElement | null>(null)
	let contentEl = $state.raw<HTMLDivElement | null>(null)
	// Reachable from the key handler, which is created before the editor exists.
	let editor = $state.raw<TextEditor | null>(null)

	// `commands.enter()` re-dispatches through `handleKeyDown`; without this guard our own handler
	// would catch the synthetic Enter and submit.
	let replayingEnter = false

	// Measure whether the content still fits on one line beside the send button, against a hidden
	// nowrap clone so marks and mention chips measure at their true width. The gap between the
	// expand and collapse thresholds is a dead zone, so the layout can't flap at the boundary.
	function remeasure() {
		const wrap = inputWrap
		const mirrorEl = mirror
		const ed = editor
		if (!wrap || !mirrorEl || !ed) return
		// Empty always fits — and measuring before TipTap has laid out reads zero widths, flashing
		// the expanded layout for a frame on mount.
		if (ed.isEmpty) {
			if (expanded) expanded = false
			return
		}
		if (wrap.clientWidth === 0) return
		const doc = ed.state.doc
		const multiBlock =
			doc.childCount > 1 || (doc.firstChild !== null && doc.firstChild.type.name !== 'paragraph')
		if (multiBlock) {
			if (!expanded) expanded = true
			return
		}
		const send = wrap.parentElement?.querySelector<HTMLElement>('.tlui-cmt-send')
		const input = wrap.querySelector('.tlui-cmt-input')
		if (!send || !input) return
		mirrorEl.innerHTML = input.innerHTML
		const textWidth = mirrorEl.offsetWidth
		// Measured against the wrap's *content* box: text wraps at clientWidth minus padding, so
		// without subtracting it the input grows a line before expansion fires and then snaps.
		const wrapStyle = getComputedStyle(wrap)
		const wrapPadX = parseFloat(wrapStyle.paddingLeft) + parseFloat(wrapStyle.paddingRight)
		const collapsedAvailable = wrap.clientWidth - wrapPadX - (expanded ? send.offsetWidth + 6 : 0)
		if (!expanded && textWidth > collapsedAvailable - 8) {
			expanded = true
		} else if (expanded && textWidth < collapsedAvailable - 24) {
			expanded = false
		}
	}

	// The editor is created once per `interactive` / `placeholder` (the old `useEditor` deps).
	// Everything else — the callbacks, `disabled`, the mention callbacks — is read through the live
	// props at event time, so changing them never recreates it.
	$effect(() => {
		const isInteractive = interactive
		const label = placeholder
		const element = contentEl
		if (!element) return

		return untrack(() => {
			const extensions = [...commentTipTapExtensions]
			// The suggestion plugin is built once and runs outside Svelte's tree, so it reads the
			// mention callbacks through the live props — otherwise it would query the roster present at
			// mount forever, never seeing a member who joins later. Whether mentions are wired at all
			// is fixed when the editor is created; the callbacks are live.
			// The mention node is always registered, or ProseMirror strips existing mentions when an
			// edited body loads. Only the `@` trigger is gated on the host providing a resolver.
			if (getMentionSuggestions) {
				const resolveSuggestions = (query: string) => getMentionSuggestions?.(query) ?? []
				extensions.push(
					createMentionExtension({
						suggestion: createMentionSuggestion(resolveSuggestions, {
							renderMember: renderMentionSuggestion ? liveMentionRow : undefined,
							editor: tlEditor,
						}),
					})
				)
			} else {
				extensions.push(createMentionExtension({ suggestion: { char: '@', allow: () => false } }))
			}

			const instance = new TextEditor({
				element,
				extensions,
				content: (value ?? EMPTY_COMMENT) as JSONContent,
				editable: isInteractive,
				// svelte-draw ships its own TextDirection extension, so TipTap's core one would warn about a
				// duplicate. Mirrors RichTextArea's setup.
				enableCoreExtensions: { textDirection: false },
				textDirection: 'auto',
				editorProps: {
					attributes: {
						class: 'tlui-cmt-input',
						'aria-label': label,
						role: 'textbox',
						'aria-multiline': 'true',
					},
					// Runs before every keymap plugin, so it can distinguish Shift+Enter from Enter — an
					// `Enter` keymap binding also fires on Shift+Enter and would otherwise swallow it.
					handleKeyDown: (_view, event) => {
						// Let the keymaps handle the synthetic Enter we replay for a Shift+Enter newline.
						if (replayingEnter) return false
						// Up in an empty composer hands off to the host. With content it stays cursor
						// movement, and with the picker open it navigates the roster.
						if (event.key === 'ArrowUp' && !event.isComposing) {
							if (onArrowUpWhenEmpty && editor?.isEmpty && !isMentionPickerOpen()) {
								onArrowUpWhenEmpty()
								return true
							}
							return false
						}
						if (event.key !== 'Enter' || event.isComposing) return false
						// While the @-mention picker is open, Enter selects the highlighted member — defer.
						if (isMentionPickerOpen()) return false
						// Shift+Enter inserts a new line by replaying a plain Enter through the keymaps, reusing
						// the editor's list-aware handling. svelte-draw doesn't do soft breaks.
						if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
							// An empty field would open the comment with a stray leading blank line.
							if (editor?.isEmpty) return true
							replayingEnter = true
							try {
								editor?.commands.enter()
							} finally {
								replayingEnter = false
							}
							return true
						}
						// Enter, Cmd+Enter, and Ctrl+Enter submit.
						if (!disabled) onSubmit?.()
						return true
					},
				},
				onUpdate: ({ editor: updated }) => {
					isEmpty = updated.isEmpty
					// The DOM is already updated here.
					remeasure()
					onChange?.(updated.getJSON() as TLRichText)
				},
			})
			editor = instance

			return () => {
				instance.destroy()
				if (editor === instance) editor = null
			}
		})
	})

	// Sync controlled resets (e.g. the parent clearing to EMPTY_COMMENT after posting) into the
	// editor without echoing back the value the editor itself just emitted.
	$effect(() => {
		const instance = editor
		const next = value
		if (!instance || next === undefined) return
		untrack(() => {
			if (isEqual(instance.getJSON(), next)) return
			instance.commands.setContent(next as JSONContent)
			isEmpty = instance.isEmpty
		})
	})

	// Measure once the editor's content is in the DOM, so a composer that mounts pre-filled (the
	// edit-in-place composer) starts in the right layout.
	$effect(() => {
		void editor
		void value
		untrack(remeasure)
	})

	// Focus on the next frame rather than via TipTap's autofocus: the composer often mounts from a
	// canvas pointer event whose default focus handling would otherwise steal it back.
	$effect(() => {
		const instance = editor
		if (!autoFocus || !instance) return
		const raf = requestAnimationFrame(() => instance.commands.focus('end'))
		return () => cancelAnimationFrame(raf)
	})

	// The frame-later focus above places the caret but can't raise iOS's software keyboard, leaving
	// the composer looking ready while it swallows every keystroke. Focus once more from the release
	// that ends the placing gesture, which can.
	$effect(() => {
		const instance = editor
		if (!autoFocus || !instance) return
		return focusOnGestureEnd(instance.view.dom.ownerDocument, () => instance.commands.focus('end'))
	})

	// The whole field behaves like the text input: clicking its empty area (the padding, or the
	// space beside/below a short line) focuses the editor rather than only the text glyphs being
	// clickable. The input (caret placement) and the send button keep their own click handling.
	function focusEditorFromField(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.tlui-cmt-input, .tlui-cmt-send')) return
		e.preventDefault()
		editor?.commands.focus('end')
	}
</script>

<!-- Renders the host's current `renderMentionSuggestion` for the picker, which is mounted outside
     this component's tree. -->
{#snippet liveMentionRow(member: MentionMember)}
	{@render renderMentionSuggestion?.(member)}
{/snippet}

<div class="tlui-cmt-composer">
	{#if leading}
		{@render leading()}
	{:else}
		<Avatar {author} />
	{/if}
	<!-- Mouse presses in the field's empty area focus the editor (a pointer-only convenience; the
	     editor itself is the keyboard-reachable control). -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={['tlui-cmt-composer__field', interactive && expanded && 'tlui-cmt-composer__field--expanded']}
		onmousedown={interactive ? focusEditorFromField : undefined}
	>
		<div class="tlui-cmt-composer__input-wrap" bind:this={inputWrap}>
			<div bind:this={contentEl}></div>
			{#if isEmpty}
				<div class="tlui-cmt-input__placeholder" aria-hidden="true">{placeholder}</div>
			{/if}
			<div class="tlui-cmt-composer__mirror tlui-cmt-input" bind:this={mirror} aria-hidden="true"></div>
		</div>
		{#if interactive}
			<SendButton label={sendLabel} onClick={onSubmit} {disabled} />
		{/if}
	</div>
</div>
