<script lang="ts">
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'
	import { quickReactor } from '../state/reactor'
	import Collaborator from './Collaborator.svelte'
	import { getEditorComponents } from './componentsContext'
	import { getSharedSafeId } from './safeId'
	import { getHtmlLayerTransform, setStyleProperty } from './utils'

	/**
	 * The collaborator cursor layer: a DOM layer stacked as a sibling of the canvas — above all canvas
	 * content, below the in-front layer and the UI panels — hosting each visible collaborator's cursor
	 * (arrow, name tag, chat message). Off-viewport collaborators are the canvas-drawn hint arrows' job
	 * (CollaboratorHintOverlayUtil), not this layer's.
	 *
	 * Cursors are DOM rather than canvas-drawn so their chrome styles and composes like the rest of
	 * the UI. Re-render traffic is kept narrow: per-cursor positioning writes `transform` directly
	 * (see `transform`), so a pointer move re-renders only the moved cursor; the camera transform
	 * is written imperatively below, so a pure pan re-renders only cursors whose viewport visibility
	 * flips (an equality-gated boolean per cursor); a zoom change re-renders every visible cursor,
	 * because each one rescales by `1/zoom`.
	 *
	 * @public
	 */
	const editor = getEditor()
	const components = getEditorComponents()

	// The inner layer carries the camera transform, so the cursor components position in page
	// space exactly as canvas content does. Unlike the canvas's html layers this one unmounts
	// while no collaborators are visible, so the transform is written at two moments: on every
	// camera change (the reactor), and whenever the layer element appears (the effect below) —
	// the reactor's last run hit a null ref while the layer was unmounted, and without the
	// render-time write a reappearing layer would keep an identity transform until the next
	// camera move.
	let htmlLayer = $state.raw<HTMLDivElement | null>(null)
	$effect(() => {
		const elm = htmlLayer
		if (!elm) return
		setStyleProperty(elm, 'transform', getHtmlLayerTransform(editor))
	})
	$effect(() => {
		const elm = htmlLayer
		return quickReactor('position collaborators layer', function positionCollaboratorsWhenCameraMoves() {
			// Reads the camera even while the layer is unmounted, keeping the subscription alive.
			const transform = getHtmlLayerTransform(editor)
			setStyleProperty(elm, 'transform', transform)
		})
	})

	// Visibility (activity state, following, highlighting) is handled by the editor.
	const collaborators = fromComputed('visible collaborators', () =>
		editor.getVisibleCollaboratorsOnCurrentPage()
	)

	const cursorId = getSharedSafeId('cursor')
</script>

{#if collaborators.current.length > 0 && components.CollaboratorCursor}
	<div class="tl-collaborators">
		<svg class="tl-svg-context" aria-hidden="true">
			<defs>
				<!-- The cursor glyph every collaborator cursor `<use>`s -->
				<g id={cursorId}>
					<g fill="rgba(0,0,0,.2)" transform="translate(-11,-9)">
						<path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
						<path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
					</g>
					<g fill="white" transform="translate(-12,-10)">
						<path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
						<path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
					</g>
					<g fill="currentColor" transform="translate(-12,-10)">
						<path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
						<path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
					</g>
				</g>
			</defs>
		</svg>
		<div bind:this={htmlLayer} class="tl-html-layer">
			{#each collaborators.current as presence (presence.userId)}
				<Collaborator latestPresence={presence} />
			{/each}
		</div>
	</div>
{/if}
