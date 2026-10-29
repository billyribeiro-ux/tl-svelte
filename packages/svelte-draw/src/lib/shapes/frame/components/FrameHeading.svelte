<script lang="ts">
	import type { TLFrameShape, TLShapeId } from '@svelte-draw/editor'
	import { fromComputed, getEditor, useIsEditing } from '@svelte-draw/svelte'
	import { getFrameHeadingSide, getFrameHeadingTranslation } from '../frameHelpers'
	import FrameLabelInput from './FrameLabelInput.svelte'

	let {
		id,
		name,
		width,
		height,
		fill,
		stroke,
		color,
		offsetX,
		showColors,
	}: {
		id: TLShapeId
		name: string
		width: number
		height: number
		fill: string
		stroke: string
		color: string
		offsetX: number
		showColors: boolean
	} = $props()

	const editor = getEditor()

	const heading = $derived.by(() => {
		const shapeId = id
		return fromComputed('shape rotation', () => {
			const shape = editor.getShape<TLFrameShape>(shapeId)
			if (!shape) {
				// meh
				return {
					side: 0,
					translation: 'translate(0, 0)',
				}
			}
			const labelSide = getFrameHeadingSide(editor, shape)
			return {
				side: labelSide,
				translation: getFrameHeadingTranslation(shape, labelSide, false),
			}
		})
	})
	const side = $derived(heading.current.side)
	const translation = $derived(heading.current.translation)

	const isEditing = useIsEditing(() => id)

	let rInput = $state.raw<HTMLInputElement | null>(null)

	$effect(() => {
		const el = rInput
		if (el && isEditing.current) {
			// On iOS, we must focus here
			el.focus()
			el.select()
		}
	})
</script>

<div
	class="tl-frame-heading"
	style:overflow={isEditing.current ? 'visible' : 'hidden'}
	style:max-width="calc(var(--tl-zoom) * {side === 0 || side === 2
		? Math.ceil(width)
		: Math.ceil(height)}px + {showColors ? '0px' : 'var(--tl-frame-offset-width)'})"
	style:bottom="100%"
	style:transform="{translation} scale(min(var(--tl-scale), 3.5)) translateX({offsetX}px)"
>
	<div
		class="tl-frame-heading-hit-area"
		style:color
		style:background-color={fill}
		style:box-shadow="inset 0px 0px 0px 1px {stroke}"
	>
		<FrameLabelInput bind:ref={rInput} {id} {name} isEditing={isEditing.current} />
	</div>
</div>
