<script lang="ts">
	import { SvelteDrawUiButton, fromSignal, getEditor } from 'svelte-draw'
	import { getFlowchartSourceError } from './flowchartSourceGuard'
	import { mapNodeToRenderSpec } from './mermaidPipelineBlueprint'
	import { type StepStatus, pipelineStateAtom, runFullPipeline } from './mermaidPipelineState'
	import { applyPipelineStepIndices, extractFlowchartPipelineFromEditor } from './pipelineFromEditor'

	const DEFAULT_MERMAID = `flowchart LR
  s1[Checkout] --> s2[Build]
  s2 --> s3[Unit tests]
  s2 --> s4[Integration tests]
  s3 --> s5[Deploy]
  s4 --> s5`

	const editor = getEditor()
	let mermaidText = $state(DEFAULT_MERMAID)
	let isApplying = $state(false)
	const pipeline = fromSignal(pipelineStateAtom)

	const canRun = $derived(
		!pipeline.current.parseError &&
			pipeline.current.nodeIds.length > 0 &&
			!pipeline.current.isRunning &&
			!isApplying
	)

	async function applyWorkflow() {
		if (isApplying) return
		if (isApplying) return
		isApplying = true
	
		try {
			const sourceError = getFlowchartSourceError(mermaidText)
			if (sourceError) {
				pipelineStateAtom.set({
					nodeIds: [],
					edges: [],
					statusByNodeId: {},
					parseError: sourceError,
					isRunning: false,
				})
				return
			}
	
			// [1]
			const { createMermaidDiagram } = await import('@svelte-draw/mermaid')
	
			editor.deleteShapes([...editor.getCurrentPageShapeIds()])
	
			try {
				// [2]
				await createMermaidDiagram(editor, mermaidText, {
					blueprintRender: {
						position: { x: 200, y: 400 },
						centerOnPosition: false,
						mapNodeToRenderSpec,
					},
				})
			} catch {
				pipelineStateAtom.set({
					nodeIds: [],
					edges: [],
					statusByNodeId: {},
					parseError: `An error occurred; please make sure your diagram is valid.`,
					isRunning: false,
				})
				return
			}
	
			// [3]
			const parsed = extractFlowchartPipelineFromEditor(editor)
			if (!parsed.ok) {
				pipelineStateAtom.set({
					nodeIds: [],
					edges: [],
					statusByNodeId: {},
					parseError: parsed.error,
					isRunning: false,
				})
			} else {
				pipelineStateAtom.set({
					nodeIds: parsed.nodeIds,
					edges: parsed.edges,
					statusByNodeId: Object.fromEntries(
						parsed.nodeIds.map((id) => [id, 'pending' as const])
					) as Record<string, StepStatus>,
					parseError: null,
					isRunning: false,
				})
				applyPipelineStepIndices(editor, parsed.stepIndexByNodeId)
			}
	
			editor.selectNone()
		} catch {
			pipelineStateAtom.update((s) => ({
				...s,
				parseError: `An error occurred; please make sure your diagram is valid.`,
			}))
		} finally {
			isApplying = false
		}
	}

	function runPipeline() {
		void runFullPipeline()
	}
</script>

<div class="custom-shape-mermaid">
	<div>
		Paste a Mermaid <strong>flowchart</strong> or <strong>graph</strong> (branching is ok; merge
		nodes run after <strong>all</strong> incoming steps pass). Apply runs Mermaid import, then
		builds the DAG from <strong>arrows on the canvas</strong>. Run simulates steps; failures can be
		retried on the shape. Step badges are Kahn layers, not a global sequence. Status is only in
		memory for this demo.
	</div>
	<textarea
		bind:value={mermaidText}
		rows={7}
		spellcheck={false}
		class="custom-shape-mermaid__textarea"
	></textarea>
	{#if pipeline.current.parseError}
		<div class="custom-shape-mermaid__error">{pipeline.current.parseError}</div>
	{/if}
	<div class="custom-shape-mermaid__controls">
		<SvelteDrawUiButton type="normal" onclick={applyWorkflow} disabled={isApplying}>
			{isApplying ? 'Applying…' : 'Apply workflow'}
		</SvelteDrawUiButton>
		<SvelteDrawUiButton type="low" onclick={runPipeline} disabled={!canRun}>
			Run pipeline
		</SvelteDrawUiButton>
	</div>
	{#if pipeline.current.isRunning}
		<div class="custom-shape-mermaid__notice">Running simulated steps…</div>
	{/if}
</div>

<!--
[1]
`@svelte-draw/mermaid` pulls in the (large) mermaid library, so it is imported lazily the first
time the user applies a workflow rather than on page load.

[2]
`blueprintRender.mapNodeToRenderSpec` lets you decide which shape each parsed Mermaid node
becomes. Our mapper (see mermaidPipelineBlueprint.ts) turns every flowchart vertex into a
`flowchart-util` shape and stores the Mermaid node id in its props so we can find it later.

[3]
The pipeline graph is not read from the Mermaid text. Instead it is rebuilt from the arrows
and arrow bindings that the import created on the canvas (see pipelineFromEditor.ts), so if
you reconnect arrows by hand and apply again the pipeline follows the drawing.
-->
