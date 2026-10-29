<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// There's a guide at the bottom of this page!

	// [1]
	let focusedEditor = $state.raw<Editor | null>(null)
	// The editor of each block, keyed by persistence key.
	let editors = $state.raw<Record<string, Editor>>({})

	// [2]
	function blurEditor(editor: Editor) {
		editor.blur({ blurContainer: false })
		editor.selectNone()
		editor.setCurrentTool('hand')
	}

	const blocks = ['block-a', 'block-b', 'block-c']
</script>

<!-- [3] -->
<div
	style="display: flex; flex-direction: column; padding: 20px; gap: 20px;"
	role="presentation"
	onpointerdown={() => {
		if (!focusedEditor) return
		blurEditor(focusedEditor)
		focusedEditor = null
	}}
>
	{#each blocks as persistenceKey (persistenceKey)}
		{@const editor = editors[persistenceKey]}
		<!-- [4] -->
		<div
			style="width: 600px; height: 400px; max-width: 100%;"
			role="presentation"
			onfocusin={() => {
				if (!editor) return
				if (focusedEditor && focusedEditor !== editor) {
					blurEditor(focusedEditor)
				}
				editor.focus({ focusContainer: false })
				focusedEditor = editor
			}}
			onpointerdown={(e) => e.stopPropagation()}
		>
			<!-- [5] [6] [7] [8] -->
			<SvelteDraw
				{persistenceKey}
				autoFocus={false}
				hideUi={focusedEditor !== editor}
				options={{
					maxPages: 0,
					edgeScrollSpeed: 0,
				}}
				components={{
					HelpMenu: null,
					NavigationPanel: null,
					MainMenu: null,
				}}
				onMount={(e) => {
					editors = { ...editors, [persistenceKey]: e }
					e.setCurrentTool('hand')
				}}
			/>
		</div>
	{/each}
</div>

<!--
[1]
State tracking which editor is focused. Only the focused editor handles keyboard
shortcuts, so several editors on one page don't fight over them. See also the
'Multiple editors' and 'Focus the editor' examples.

[2]
Called on any editor that loses focus. `blurContainer: false` stops the editor's
DOM container from being blurred (we manage focus at the block level), and we reset
the user's tool state so nothing is left selected or half-drawn.

[3]
Clicking anywhere on the page outside an editor blurs the focused one.

[4]
Clicking into a block focuses its editor and blurs whichever was focused before.
Stopping pointer-down propagation keeps [3] from immediately blurring it again.
(React's `onFocus` bubbles, so the Svelte equivalent is `onfocusin`.)

[5]
Unfocused editors hide their UI.

[6]
`maxPages: 0` removes the pages menu. `edgeScrollSpeed: 0` disables edge scrolling,
which is too easily triggered when the canvas is small.

[7]
Drop UI components that don't earn their space in a small block.

[8]
Default to the hand tool on mount so scrolling past a block doesn't accidentally
move shapes, and keep a reference to the editor for the focus handlers.
-->
