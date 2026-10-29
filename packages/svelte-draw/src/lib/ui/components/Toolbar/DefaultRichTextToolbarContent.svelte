<script lang="ts" module>
	import { defineMessages, type TiptapEditor, type TLI18nMessage } from '@svelte-draw/editor'

	// Keyed on the action name rather than written at the call site, which used to compose the id
	// from `name` and so hid every one of these from the extractor. Only the actions this toolbar
	// builds are here; the other `tool.rich-text-*` strings are referenced directly, from the link
	// editor and the keyboard shortcuts dialog.
	const richTextMessages: Record<string, TLI18nMessage> = defineMessages({
		bold: { id: 'tool.rich-text-bold', defaultMessage: 'Bold' },
		italic: { id: 'tool.rich-text-italic', defaultMessage: 'Italic' },
		code: { id: 'tool.rich-text-code', defaultMessage: 'Code' },
		link: { id: 'tool.rich-text-link', defaultMessage: 'Link' },
		bulletList: { id: 'tool.rich-text-bulletList', defaultMessage: 'Bulleted list' },
		highlight: { id: 'tool.rich-text-highlight', defaultMessage: 'Highlight' },
	})

	/** @public */
	export interface DefaultRichTextToolbarContentProps {
		onEditLinkStart?(): void
		textEditor: TiptapEditor
	}
</script>

<script lang="ts">
	import { isAccelKey, preventDefault } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getUiEvents, type TLUiEventMap } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'

	/**
	 * Rich text toolbar items that have the basics.
	 *
	 * @public
	 */
	let { textEditor, onEditLinkStart }: DefaultRichTextToolbarContentProps = $props()

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const msg = getTranslation()
	const source = 'rich-text-menu'

	// We need to force this one to update when the editor updates or when selection changes
	let updateCount = $state(0)
	$effect(function forceUpdateWhenContentChanges() {
		function forceUpdate() {
			updateCount++
		}
		// Capture: the prop is already null when this teardown runs.
		const te = textEditor
		te.on('update', forceUpdate)
		te.on('selectionUpdate', forceUpdate)
		return () => {
			te.off('update', forceUpdate)
			te.off('selectionUpdate', forceUpdate)
		}
	})

	$effect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (onEditLinkStart && isAccelKey(event) && event.shiftKey && event.key === 'k') {
				event.preventDefault()
				onEditLinkStart()
			}
		}

		const doc = editor.getContainerDocument()
		doc.addEventListener('keydown', handleKeyDown)
		return () => {
			doc.removeEventListener('keydown', handleKeyDown)
		}
	})

	// todo: we could make this a prop
	const actions = $derived.by(() => {
		function handleOp(name: TLUiEventMap['rich-text']['operation'], op: string) {
			// Check if the editor view is available before calling operations
			if (!textEditor.view) return

			trackEvent('rich-text', { operation: name, source })
			// @ts-expect-error typing this is annoying at the moment.
			textEditor.chain().focus()[op]().run()
		}

		return [
			// { name: 'heading', attrs: { level: 3 }, onSelect() { textEditor.chain().focus().toggleHeading({ level: 3}).run() }},
			{
				name: 'bold',
				onSelect() {
					handleOp('bold', 'toggleBold')
				},
			},
			{
				name: 'italic',
				onSelect() {
					handleOp('italic', 'toggleItalic')
				},
			},
			// { name: 'underline', onSelect() { handleOp('underline', 'toggleUnderline') }},
			// { name: 'strike', onSelect() { handleOp('strike', 'toggleStrike')  }},
			{
				name: 'code',
				onSelect() {
					handleOp('code', 'toggleCode')
				},
			},
			onEditLinkStart
				? {
						name: 'link',
						onSelect() {
							onEditLinkStart()
						},
					}
				: undefined, // ? is this really optional?
			{
				name: 'bulletList',
				onSelect() {
					handleOp('bulletList', 'toggleBulletList')
				},
			},
			{
				name: 'highlight',
				onSelect() {
					handleOp('highlight', 'toggleHighlight')
				},
			},
		].filter(Boolean) as {
			name: string
			attrs?: string
			onSelect(): void
		}[]
	})

	// Reads `updateCount` so the active state is re-evaluated after every update / selection change.
	function isActionActive(name: string, attrs?: string) {
		void updateCount
		return textEditor.view ? textEditor.isActive(name, attrs) : false
	}
</script>

{#each actions as { name, attrs, onSelect } (name)}
	{@const isActive = isActionActive(name, attrs)}
	<SvelteDrawUiToolbarButton
		title={msg(richTextMessages[name] ?? `tool.rich-text-${name}`)}
		data-testid={`rich-text.${name}`}
		type="icon"
		{isActive}
		onpointerdown={preventDefault}
		onclick={onSelect}
		role="option"
		aria-pressed={isActive}
	>
		<SvelteDrawUiButtonIcon small icon={name} />
	</SvelteDrawUiToolbarButton>
{/each}
