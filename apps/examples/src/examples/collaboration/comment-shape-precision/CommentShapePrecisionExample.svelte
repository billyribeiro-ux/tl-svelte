<script lang="ts">
	import { CommentTool, commentToolOverrides } from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		commentSchemaRecords,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		toRichText,
		type Editor,
		type TLComponents,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import './comment-shape-precision.css'
	import CommentsLayer from './CommentsLayer.svelte'

	// [1]
	const MODE_TOOLS = {
		always: [CommentTool],
		never: [CommentTool.configure({ shouldBePrecise: () => false })],
		alt: [CommentTool.configure({ shouldBePrecise: (_editor, { altKey }) => altKey })],
		notes: [
			CommentTool.configure({
				shouldBePrecise: (editor, { shapeId }) => editor.getShape(shapeId)?.type === 'note',
			}),
		],
	}

	type PrecisionMode = keyof typeof MODE_TOOLS

	const MODES = Object.keys(MODE_TOOLS) as PrecisionMode[]

	const MODE_LABELS: Record<PrecisionMode, string> = {
		always: 'Always precise (default)',
		never: 'Shape only',
		alt: 'Alt for precise',
		notes: 'Notes precise',
	}

	const handleMount = (editor: Editor) => {
		// A shape and a note to comment on. The store survives mode switches, so only seed once.
		if (editor.getCurrentPageShapeIds().size === 0) {
			editor.run(
				() => {
					editor.createShapes([
						{
							type: 'geo',
							x: 100,
							y: 160,
							props: { geo: 'rectangle', w: 280, h: 180, richText: toRichText('A shape') },
						},
						{
							type: 'note',
							x: 460,
							y: 150,
							props: { richText: toRichText('A note') },
						},
					])
				},
				{ history: 'ignore' }
			)
		}
		editor.zoomToBounds({ x: 40, y: 60, w: 700, h: 400 }, { immediate: true })
	}

	let mode = $state<PrecisionMode>('always')

	// Comments live in the editor's own store as records; sharing one store across mode switches
	// keeps every placed thread visible while the tool is reconfigured.
	const store = createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) })

	const components: TLComponents = { InFrontOfTheCanvas: CommentsLayer }
</script>

<div class="svelte-draw__editor">
	<!-- [2] -->
	{#key mode}
		<!-- Commenting is a licensed feature. Every feature is enabled in local development, but a
			deployed app needs a license key that includes commenting — swap in your own key here. -->
		<SvelteDraw
			licenseKey={getLicenseKey()}
			{store}
			onMount={handleMount}
			tools={MODE_TOOLS[mode]}
			overrides={[commentToolOverrides]}
			{components}
		>
			<div class="tlui-menu comment-precision-panel">
				{#each MODES as id (id)}
					<SvelteDrawUiButton
						type={mode === id ? 'primary' : 'normal'}
						onclick={() => (mode = id)}
					>
						<SvelteDrawUiButtonLabel>{MODE_LABELS[id]}</SvelteDrawUiButtonLabel>
					</SvelteDrawUiButton>
				{/each}
			</div>
		</SvelteDraw>
	{/key}
</div>

<!--
[1]
One configured comment tool per mode, built once at module level so each array keeps a stable
identity. `shouldBePrecise` decides what commenting on a shape produces: a precise anchor, pinned to
the exact clicked spot within the shape (the default), or an imprecise one, pinned to the shape as
a whole and rendered at `impreciseShapeAnchor`. It's called with the target shape's id, the
release point, and the Alt key's state, so it can be a constant, an Alt-gated choice, or a decision
from the shape itself, like "precise only on notes".

[2]
Commenting options are fixed at tool registration (`CommentTool.configure`), so switching modes
remounts the editor (`{#key mode}`) with the newly configured tool. The shared store carries the
comments across.
-->
