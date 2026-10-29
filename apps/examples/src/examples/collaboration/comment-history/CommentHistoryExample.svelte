<script lang="ts">
	import { commentToolOverrides } from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		commentSchemaRecords,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		toRichText,
		type Editor,
		type TLComponents,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import './comment-history.css'
	import CommentsLayer from './CommentsLayer.svelte'
	import HistoryPanel from './HistoryPanel.svelte'
	import { MODE_TOOLS, type HistoryMode } from './historyModes'

	function handleMount(editor: Editor) {
		// The store outlives a mode switch, so only seed on the first mount.
		if (editor.getCurrentPageShapeIds().size === 0) {
			editor.run(
				() => {
					editor.createShapes([
						{
							type: 'geo',
							x: 180,
							y: 180,
							props: { geo: 'rectangle', w: 300, h: 200, richText: toRichText('Move me') },
						},
					])
				},
				// [2]
				{ history: 'ignore' }
			)
		}
		editor.zoomToBounds({ x: 100, y: 100, w: 620, h: 380 }, { immediate: true })
	}

	let mode = $state<HistoryMode>('ignore')

	// Comments are records in the editor's own store. Sharing one store across mode switches keeps
	// every thread you place while the tool is reconfigured.
	const store = createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) })

	const components: TLComponents = { InFrontOfTheCanvas: CommentsLayer }
</script>

<div class="svelte-draw__editor">
	<!-- [4] -->
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
			<!-- [3] -->
			<HistoryPanel {mode} onModeChange={(next) => (mode = next)} />
		</SvelteDraw>
	{/key}
</div>

<!--
[1]
One configured comment tool per mode (`historyModes.ts`). `history` governs how every comment write
— posting, replying, editing, resolving, deleting — interacts with the editor's undo stack, and
`dragHistory` overrides it for pin drags alone.

`'ignore'` is the default, and it's the right one for a shared document: an undoable delete
resurrects a thread a collaborator already removed, and an undoable resolve reverts their newer
state. `'record'` is safe single-player, or against a comment store that isn't synced.

Pin drags are the interesting exception. Re-anchoring a comment is a spatial edit that may
reasonably undo alongside a shape move, so it can be recorded while posts stay ignored — the third
mode here.

[2]
The same option, used directly. Seeded shapes shouldn't be undoable either, so the seeding run is
wrapped in `history: 'ignore'` — otherwise the first undo would delete the shape the example is
about.

[3]
The counts come from the live comment threads and comments, read reactively. Watching them while
you press undo is the whole point: in `'ignore'` mode they never move, and in `'record'` mode they
tick down.

[4]
Commenting options are fixed when the tool is registered, so switching modes remounts the editor
with a newly configured tool. The shared store carries the comments across, but the undo stack is
part of the editor, not the store — so it starts empty after every switch.
-->
