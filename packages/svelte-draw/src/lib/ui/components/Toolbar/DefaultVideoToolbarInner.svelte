<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TLVideoShape } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface DefaultVideoToolbarInnerProps {
		children?: Snippet
		videoShapeId: TLVideoShape['id']
	}

	const messages = defineMessages({
		toolVideoToolbarTitle: { id: 'tool.video-toolbar-title', defaultMessage: 'Video tools' },
	})
</script>

<script lang="ts">
	import { Box } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiContextualToolbar from '../primitives/SvelteDrawUiContextualToolbar.svelte'
	import AltTextEditor from './AltTextEditor.svelte'
	import DefaultVideoToolbarContent from './DefaultVideoToolbarContent.svelte'

	let { children, videoShapeId }: DefaultVideoToolbarInnerProps = $props()

	const editor = getEditor()
	const msg = getTranslation()

	let isEditingAltText = $state(false)
	function handleEditAltTextStart() {
		isEditingAltText = true
	}
	function onEditAltTextClose() {
		isEditingAltText = false
	}

	function getSelectionBounds() {
		const fullBounds = editor.getSelectionScreenBounds()
		if (!fullBounds) return undefined
		return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0)
	}
</script>

<SvelteDrawUiContextualToolbar
	class="tlui-media__toolbar tlui-video__toolbar"
	{getSelectionBounds}
	label={msg(messages.toolVideoToolbarTitle)}
>
	{#if children}
		{@render children()}
	{:else if isEditingAltText}
		<AltTextEditor shapeId={videoShapeId} onClose={onEditAltTextClose} source="video-toolbar" />
	{:else}
		<DefaultVideoToolbarContent {videoShapeId} onEditAltTextStart={handleEditAltTextStart} />
	{/if}
</SvelteDrawUiContextualToolbar>
