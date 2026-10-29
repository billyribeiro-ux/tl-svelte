import type { Component } from 'svelte'
import { atom, type Editor, type TLComponents } from 'svelte-draw'
import ContentLayer from './ContentLayer.svelte'
import Controls from './Controls.svelte'
import { type Corpus, layoutCorpus } from './layout'
import { goToWhole } from './navigation'

/**
 * Build the editor wiring for one corpus. Called once at module scope so the
 * layout — a pure function of content that never changes — is computed a single
 * time and shared by the canvas layer, the camera and the search index.
 */
export function createSemanticZoom(corpus: Corpus) {
	const layout = layoutCorpus(corpus)

	// The canvas layer lives inside the camera transform and the controls live
	// outside it, so they occupy different component slots and cannot share
	// component state directly. A signal is the shared ground between them.
	const matches = atom<ReadonlySet<string>>('semantic zoom matches', new Set<string>())

	// The editor slots mount their components without props, so these wrappers close over the
	// layout, corpus and signal and forward them to the real components.
	const SemanticZoomCanvas: Component = (anchor) =>
		ContentLayer(anchor, { layout, corpus, matches })
	const SemanticZoomControls: Component = (anchor) => Controls(anchor, { layout, matches })

	const components: TLComponents = {
		OnTheCanvas: SemanticZoomCanvas,
		TopPanel: SemanticZoomControls,
	}

	return {
		components,
		options: {
			camera: {
				// Reading a whole work end to end takes a couple of orders of
				// magnitude, and the default steps stop at 8x.
				zoomSteps: [0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256],
			},
		},
		onMount(editor: Editor) {
			goToWhole(editor, layout, 0)
		},
	}
}
