<script lang="ts">
	import type { SvgExportScene } from '@svelte-draw/editor'
	import { setIdScope } from '../canvas/safeId'
	import { setContainer, setEditor } from '../context/editor'
	import { setSvgExportContext } from './context'
	import ExportView from './ExportView.svelte'

	let { scene }: { scene: SvgExportScene } = $props()

	// The scene is fixed for the lifetime of one export, so capturing it once is intended.
	// svelte-ignore state_referenced_locally
	const { editor, context } = scene
	setEditor(editor)
	setContainer(editor.getContainer())
	// The React export tree sat under EditorProvider, which started an id scope; shapes derive shared ids (e.g. fill patterns) from it.
	setIdScope()
	setSvgExportContext(context)

	// svelte-ignore state_referenced_locally
	let sceneState = $state.raw(scene.getState())

	$effect(() => {
		// state may have changed between the initial read and this effect running
		sceneState = scene.getState()
		return scene.subscribe(() => {
			sceneState = scene.getState()
		})
	})

	// svelte-ignore state_referenced_locally
	const Provider = scene.exportProvider as import('svelte').Component<{
		children: import('svelte').Snippet
	}> | null
</script>

{#snippet content()}
	<svg
		preserveAspectRatio={scene.preserveAspectRatio}
		direction="ltr"
		width={scene.width}
		height={scene.height}
		viewBox="{scene.viewBox.minX} {scene.viewBox.minY} {scene.viewBox.width} {scene.viewBox.height}"
		stroke-linecap="round"
		stroke-linejoin="round"
		style:background-color={scene.backgroundColor}
		data-color-mode={scene.colorMode}
		class={scene.className}
	>
		<defs>
			{#each sceneState.defs as def (def.key)}
				{#if def.content?.type === 'view'}
					<ExportView view={def.content.view} />
				{:else if def.content?.type === 'clipPath'}
					<clipPath id={def.content.id}>
						<path d={def.content.d} />
					</clipPath>
				{:else if def.content?.type === 'style'}
					<!-- <style> text is not interpolated by Svelte; a dynamic element is -->
					<svelte:element this={'style'} nonce={def.content.nonce}>{def.content.css}</svelte:element>
				{/if}
			{/each}
		</defs>
		{#each sceneState.layers ?? [] as layer (layer.key)}
			{#if layer.kind === 'svg'}
				<g transform={layer.transform} opacity={layer.opacity} clip-path={layer.clipPath}>
					<ExportView view={layer.view} />
				</g>
			{:else}
				<!-- A shape that fails to render is dropped from the export. -->
				<svelte:boundary onerror={(e) => console.warn('[svelte-draw] Shape failed to render for export', e)}>
					<foreignObject
						x={layer.bounds.x}
						y={layer.bounds.y}
						width={layer.bounds.width}
						height={layer.bounds.height}
						class="tl-shape-foreign-object tl-export-embed-styles"
					>
						<div
							class={layer.className}
							data-shape-type={layer.shapeType}
							style:clip-path={layer.style.clipPath}
							style:transform={layer.style.transform}
							style:width="{layer.style.width}px"
							style:height="{layer.style.height}px"
							style:opacity={layer.style.opacity}
						>
							{#if layer.view}
								<ExportView view={layer.view} />
							{/if}
						</div>
					</foreignObject>
					{#snippet failed()}{/snippet}
				</svelte:boundary>
			{/if}
		{/each}
	</svg>
{/snippet}

{#if Provider}
	<Provider children={content} />
{:else}
	{@render content()}
{/if}
