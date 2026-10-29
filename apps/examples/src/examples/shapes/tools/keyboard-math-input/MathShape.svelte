<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import { getEditor, type TLShapeId } from 'svelte-draw'
	import MathInput from './MathInput.svelte'
	import MathRendered from './MathRendered.svelte'
	import { MATH_SHAPE_TYPE, MIN_H, MIN_W, type IMathShape } from './MathShapeUtil'

	let { id, text, isEditing }: { id: TLShapeId; text: string; isEditing: boolean } = $props()

	const editor = getEditor()

	let ref = $state<HTMLDivElement | null>(null)

	// [5]
	$effect(() => {
		const el = ref
		if (!el) return
		const measure = () => {
			const w = Math.max(MIN_W, Math.ceil(el.offsetWidth))
			const h = Math.max(MIN_H, Math.ceil(el.offsetHeight))
			const current = editor.getShape<IMathShape>(id)
			if (!current) return
			if (Math.abs(w - current.props.w) > 1 || Math.abs(h - current.props.h) > 1) {
				editor.updateShape<IMathShape>({
					id,
					type: MATH_SHAPE_TYPE,
					props: { w, h },
				})
			}
		}
		const observer = new ResizeObserver(measure)
		observer.observe(el)
		measure()
		return () => observer.disconnect()
	})
</script>

<HTMLContainer>
	<!-- [6] -->
	<div
		bind:this={ref}
		class={['math-text', isEditing && 'math-text-editing']}
		style:pointer-events={isEditing ? 'all' : 'none'}
	>
		{#if isEditing}
			{#if text.trim() !== ''}
				<!-- [7] -->
				<div class="math-preview">
					<MathRendered {text} />
				</div>
			{/if}
			<MathInput
				{text}
				onChange={(next) =>
					editor.updateShape<IMathShape>({
						id,
						type: MATH_SHAPE_TYPE,
						props: { text: next },
					})}
				onDone={() => editor.setEditingShape(null)}
			/>
		{:else}
			<MathRendered {text} />
		{/if}
	</div>
</HTMLContainer>
