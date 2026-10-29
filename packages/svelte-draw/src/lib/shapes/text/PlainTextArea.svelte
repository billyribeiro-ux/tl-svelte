<script lang="ts">
	import { preventDefault } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { untrack } from 'svelte'
	import { nativeEvents } from '../shared/nativeEvents'
	import type { TextAreaProps } from './TextAreaProps'

	/**
	 * A plain text area that can be used for basic editing text. Bind `ref` to get the textarea.
	 *
	 * @public
	 */
	let {
		ref = $bindable(null),
		isEditing,
		text,
		handleFocus,
		handleChange,
		handleKeyDown,
		handlePaste,
		handleBlur,
		handleInputPointerDown,
		handleDoubleClick,
	}: TextAreaProps & { ref?: HTMLTextAreaElement | null } = $props()

	const editor = getEditor()

	// React's `defaultValue`: the text is only the initial value. Once mounted the textarea owns it.
	function initialValue(element: HTMLTextAreaElement) {
		element.value = untrack(() => text) ?? ''
	}
</script>

<!--
	These are native listeners (see nativeEvents) so that they run before the editor container's own
	listeners, like React's synthetic handlers did.
-->
<textarea
	bind:this={ref}
	class="tl-text tl-text-input"
	name="text"
	tabindex="-1"
	disabled={!isEditing}
	readonly={!isEditing}
	autocomplete="off"
	autocapitalize="off"
	{...{ autosave: 'off', autocorrect: 'off' }}
	placeholder=""
	spellcheck="true"
	wrap="off"
	dir="auto"
	{@attach initialValue}
	{@attach nativeEvents<HTMLTextAreaElement>({
		focus: () => handleFocus(),
		input: (e) => handleChange({ plaintext: (e.target as HTMLTextAreaElement).value }),
		keydown: (e) => handleKeyDown(e),
		blur: () => handleBlur(),
		touchend: (e) => editor.markEventAsHandled(e),
		contextmenu: (e) => {
			if (isEditing) e.stopPropagation()
		},
		pointerdown: (e) => handleInputPointerDown(e),
		paste: (e) => handlePaste(e),
		dblclick: (e) => handleDoubleClick(e),
		// On FF, there's a behavior where dragging a selection will grab that selection into
		// the drag event. However, once the drag is over, and you select away from the textarea,
		// starting a drag over the textarea will restart a selection drag instead of a shape drag.
		// This prevents that default behavior in FF.
		dragstart: (e) => preventDefault(e),
	})}
></textarea>
