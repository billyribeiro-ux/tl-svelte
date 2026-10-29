<script lang="ts">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		fromComputed,
		getEditor,
		type TLShapeId,
	} from 'svelte-draw'
	import { isUniformlyStyled, setMarkOnShape, type Style } from './richTextMarks'

	// [4]
	let {
		style,
		icon,
		label,
		textShapeIds,
	}: {
		style: Style
		icon: string
		label: string
		textShapeIds: TLShapeId[]
	} = $props()

	const editor = getEditor()

	// Re-created whenever `style` / `textShapeIds` change, because the signal computation below
	// can't track Svelte props.
	const isActive = $derived(
		fromComputed(`all ${style}`, () =>
			textShapeIds.every((id) => isUniformlyStyled(editor, id, style))
		)
	)
</script>

<SvelteDrawUiButton
	type="menu"
	isActive={isActive.current}
	onclick={() => {
		const active = isActive.current
		editor.run(() => {
			editor.markHistoryStoppingPoint(`toggle ${style}`)
			editor.getSelectedShapeIds().forEach((id) => {
				setMarkOnShape(editor, id, style, !active)
			})
		})
	}}
	title={`${label} all text in selected shapes`}
>
	<SvelteDrawUiButtonIcon {icon} />
	<SvelteDrawUiButtonLabel>{label} all</SvelteDrawUiButtonLabel>
</SvelteDrawUiButton>
