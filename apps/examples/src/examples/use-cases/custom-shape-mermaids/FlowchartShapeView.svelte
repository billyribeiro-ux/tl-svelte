<script lang="ts">
	import { HTMLContainer, RichTextLabel, type RichTextLabelProps } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'
	import { getEditor } from 'svelte-draw'
	import type { StepStatus } from './mermaidPipelineState'
	import { retryPipelineFromNode } from './mermaidPipelineState'

	let {
		shapeId,
		type,
		w,
		h,
		status,
		pipelineStepIndex,
		mermaidNodeId,
		fontFamily,
		fontSize,
		lineHeight,
		textAlign,
		verticalAlign,
		richText,
		isSelected,
		labelColor,
	}: {
		shapeId: RichTextLabelProps['shapeId']
		type: RichTextLabelProps['type']
		w: number
		h: number
		status: StepStatus
		pipelineStepIndex: number
		mermaidNodeId: string
		fontFamily: string
		fontSize: number
		lineHeight: number
		textAlign: RichTextLabelProps['textAlign']
		verticalAlign: RichTextLabelProps['verticalAlign']
		richText: RichTextLabelProps['richText']
		isSelected: boolean
		labelColor: string
	} = $props()

	const editor = getEditor()

	// So the select tool does not treat the press as a canvas/shape drag before `click` fires.
	// Svelte delegates `onpointerdown` to the app root, which runs after the editor container's
	// native listener, so this has to be a native listener on the button.
	const markHandled: Attachment<HTMLButtonElement> = (button) =>
		on(button, 'pointerdown', (e) => editor.markEventAsHandled(e))
</script>

<HTMLContainer
	class={`flowchart-util-shape flowchart-util-shape--${status}`}
	style="width: {w}px; height: {h}px;"
>
	{#if pipelineStepIndex > 0}
		<div class="flowchart-util-shape__step-badge">Step {pipelineStepIndex}</div>
	{/if}
	<div class="flowchart-util-shape__label">
		<RichTextLabel
			{shapeId}
			{type}
			{fontFamily}
			{fontSize}
			{lineHeight}
			padding={12}
			{textAlign}
			{verticalAlign}
			{richText}
			{isSelected}
			{labelColor}
			wrap
			showTextOutline={false}
		/>
	</div>
	{#if status === 'failed'}
		<button
			{@attach markHandled}
			type="button"
			class="flowchart-util-shape__retry"
			onclick={() => void retryPipelineFromNode(mermaidNodeId)}
		>
			Retry
		</button>
	{/if}
</HTMLContainer>
