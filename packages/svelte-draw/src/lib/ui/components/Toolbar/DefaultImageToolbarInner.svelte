<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TLImageShape } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface DefaultImageToolbarInnerProps {
		children?: Snippet
		imageShapeId: TLImageShape['id']
	}

	const messages = defineMessages({
		toolImageToolbarTitle: { id: 'tool.image-toolbar-title', defaultMessage: 'Image tools' },
	})
</script>

<script lang="ts">
	import { Box } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiContextualToolbar from '../primitives/SvelteDrawUiContextualToolbar.svelte'
	import AltTextEditor from './AltTextEditor.svelte'
	import DefaultImageToolbarContent from './DefaultImageToolbarContent.svelte'

	let { children, imageShapeId }: DefaultImageToolbarInnerProps = $props()

	const editor = getEditor()
	const msg = getTranslation()

	const isChangingCrop = fromComputed('editor path', () =>
		editor.isInAny(
			'select.crop.cropping',
			'select.crop.pointing_crop_handle',
			'select.crop.translating_crop'
		)
	)
	const camera = fromComputed('camera', () => editor.getCamera())
	const isInCropTool = fromComputed('editor path', () => editor.isIn('select.crop.'))
	let previousSelectionBounds: Box | undefined = undefined

	function handleManipulatingEnd() {
		editor.setCroppingShape(null)
		editor.setCurrentTool('select.idle')
	}

	let isEditingAltText = $state(false)
	function handleEditAltTextStart() {
		isEditingAltText = true
	}
	function handleManipulatingStart() {
		editor.setCurrentTool('select.crop.idle')
	}
	function onEditAltTextClose() {
		isEditingAltText = false
	}

	$effect(() => {
		void camera.current
		previousSelectionBounds = undefined
	})

	$effect(() => {
		if (isChangingCrop.current) previousSelectionBounds = undefined
	})

	// A new function whenever `isInCropTool` changes, so the contextual toolbar re-computes its
	// position, as it did when the React callback's identity changed.
	const getSelectionBounds = $derived.by(() => {
		const inCropTool = isInCropTool.current
		return () => {
			if (inCropTool && previousSelectionBounds) {
				// If we're cropping we want to be able to keep the toolbar in the same position.
				return previousSelectionBounds
			}
			const fullBounds = editor.getSelectionScreenBounds()
			if (!fullBounds) return undefined
			const bounds = new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0)
			previousSelectionBounds = bounds
			return bounds
		}
	})
</script>

{#if !isChangingCrop.current}
	<SvelteDrawUiContextualToolbar
		class="tlui-media__toolbar tlui-image__toolbar"
		{getSelectionBounds}
		label={msg(messages.toolImageToolbarTitle)}
	>
		{#if children}
			{@render children()}
		{:else if isEditingAltText}
			<AltTextEditor shapeId={imageShapeId} onClose={onEditAltTextClose} source="image-toolbar" />
		{:else}
			<DefaultImageToolbarContent
				{imageShapeId}
				isManipulating={isInCropTool.current}
				onEditAltTextStart={handleEditAltTextStart}
				onManipulatingStart={handleManipulatingStart}
				onManipulatingEnd={handleManipulatingEnd}
			/>
		{/if}
	</SvelteDrawUiContextualToolbar>
{/if}
