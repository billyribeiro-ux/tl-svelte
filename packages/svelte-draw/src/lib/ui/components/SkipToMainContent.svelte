<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		a11ySkipToMainContent: {
			id: 'a11y.skip-to-main-content',
			defaultMessage: 'Move focus to canvas',
		},
	})
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import { suppressBackToContent } from './HelperButtons/BackToContent.svelte'
	import SvelteDrawUiButton from './primitives/Button/SvelteDrawUiButton.svelte'

	const editor = getEditor()
	const msg = getTranslation()
	let button = $state<HTMLButtonElement | null>(null)

	function handleNavigateToFirstShape(e: MouseEvent | KeyboardEvent) {
		editor.markEventAsHandled(e)
		button?.blur()
		const shapes = editor.getCurrentPageShapesInReadingOrder()
		if (!shapes.length) return
		editor.setSelectedShapes([shapes[0].id])
		suppressBackToContent(editor, editor.options.animationMediumMs)
		editor.zoomToSelectionIfOffscreen(256, {
			animation: {
				duration: editor.options.animationMediumMs,
			},
			inset: 0,
		})

		// N.B. If we don't do this, then we go into editing mode for some reason...
		// Not sure of a better solution at the moment...
		editor.timers.setTimeout(() => editor.getContainer().focus(), 100)
	}
</script>

<SvelteDrawUiButton
	bind:ref={button}
	type="low"
	tabindex={0}
	class="tl-skip-to-main-content"
	onclick={handleNavigateToFirstShape}
>
	{msg(messages.a11ySkipToMainContent)}
</SvelteDrawUiButton>
