<script module lang="ts">
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		actionRename: { id: 'action.rename', defaultMessage: 'Rename' },
	})
</script>

<script lang="ts">
	import type { TLFrameShape, TLShapeId } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { untrack } from 'svelte'
	import { PORTRAIT_BREAKPOINT } from '../../../ui/constants'
	import { getBreakpoint } from '../../../ui/context/breakpoints'
	import { getTranslation } from '../../../ui/hooks/useTranslation/useTranslation.svelte'
	import { nativeEvents } from '../../shared/nativeEvents'
	import { defaultEmptyAs } from '../frameHelpers'

	let {
		ref = $bindable(null),
		id,
		name,
		isEditing,
	}: { ref?: HTMLInputElement | null; id: TLShapeId; name: string; isEditing: boolean } = $props()

	const editor = getEditor()
	const breakpoint = getBreakpoint()
	const isCoarsePointer = fromComputed('isCoarsePointer', () => editor.getInstanceState().isCoarsePointer)
	const msg = getTranslation()

	const shouldUseWindowPrompt = $derived(
		breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM && isCoarsePointer.current
	)

	let promptOpen = false

	function renameFrame(value: string) {
		const shape = editor.getShape<TLFrameShape>(id)
		if (!shape) return

		const currentName = shape.props.name
		if (currentName === value) return

		editor.updateShapes([
			{
				id,
				type: 'frame',
				props: { name: value },
			},
		])
	}

	/* Mobile rename uses window.prompt */
	$effect(() => {
		if (!isEditing) {
			promptOpen = false
			return
		}
		if (shouldUseWindowPrompt && !promptOpen) {
			untrack(() => {
				promptOpen = true
				const shape = editor.getShape<TLFrameShape>(id)
				const currentName = shape?.props.name ?? ''
				const newName = window.prompt(msg(messages.actionRename), currentName)
				promptOpen = false
				if (newName !== null) renameFrame(newName)
				editor.setEditingShape(null)
			})
		}
	})

	// React's `autoFocus`: focus on mount unless the mobile prompt is used.
	function autoFocus(element: HTMLInputElement) {
		if (!untrack(() => shouldUseWindowPrompt)) element.focus()
	}
</script>

<div class="tl-frame-label {isEditing && !shouldUseWindowPrompt ? 'tl-frame-label__editing' : ''}">
	<!--
		pointerdown and keydown are native listeners (see nativeEvents): they have to mark the event as
		handled before the editor container's own listeners see it.
	-->
	<input
		bind:this={ref}
		class="tl-frame-name-input"
		disabled={!isEditing || shouldUseWindowPrompt}
		readonly={!isEditing || shouldUseWindowPrompt}
		style:display={isEditing ? undefined : 'none'}
		value={name}
		draggable={false}
		{@attach autoFocus}
		{@attach nativeEvents<HTMLInputElement>({
			keydown: (e) => {
				if (e.key === 'Enter' && !e.isComposing) {
					// need to prevent the enter keydown making it's way up to the Idle state
					// and sending us back into edit mode
					editor.markEventAsHandled(e)
					ref?.blur()
					editor.setEditingShape(null)
				}
			},
			pointerdown: (e) => {
				if (isEditing) editor.markEventAsHandled(e)
			},
			blur: (e) => renameFrame((e.currentTarget as HTMLInputElement).value),
		})}
		oninput={(e) => renameFrame(e.currentTarget.value)}
	/>
	{defaultEmptyAs(name, 'Frame') + String.fromCharCode(8203)}
</div>
