<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getEditorPortalHost } from './editorPortal'

	/**
	 * Renders its children into the end of the editor's container, escaping the canvas layer.
	 *
	 * Use this for anything anchored to canvas coordinates that also has to draw over the UI — a
	 * popover on a shape, a comment thread, an annotation panel. The `OnTheCanvas` and
	 * `InFrontOfTheCanvas` slots are fixed layers, each its own stacking context, so content mounted
	 * there can't paint above whatever outranks its layer whatever z-index it asks for. Mount in
	 * whichever slot suits your data flow, wrap the part that needs its own layer in this, and give
	 * that part a z-index.
	 *
	 * This package's own layers stop at 250 (`--tl-layer-canvas-in-front`); above that belongs to
	 * whatever renders the UI. In `svelte-draw` that's `--tl-layer-panels` (300) and `--tl-layer-menus`
	 * (400), defined by `svelte-draw`'s stylesheet rather than this one.
	 *
	 * Positioning still resolves against the editor's container, so a `position: absolute` child uses
	 * ordinary container coordinates.
	 *
	 * Prefer this over appending to the container yourself, which picks its DOM position from the
	 * moment it mounts — landing the node ahead of the UI and of the "skip to main content" link
	 * that only works while nothing precedes it. This host is a real element placed last, so ordering
	 * is fixed rather than dependent on mount timing.
	 *
	 * Svelte has no portal primitive, so the children are rendered (with the component's context and
	 * reactivity intact) inside a `display: contents` wrapper which is then moved into the host.
	 *
	 * @example
	 * ```svelte
	 * <!-- 400 clears svelte-draw's menus layer; the bare editor's own layers stop at 250. -->
	 * <EditorPortal>
	 * 	<div style="position: absolute; left: {point.x}px; top: {point.y}px; z-index: 400">
	 * 		Above the UI
	 * 	</div>
	 * </EditorPortal>
	 * ```
	 *
	 * @public
	 */
	let { children }: { children: Snippet } = $props()

	const portalHost = getEditorPortalHost()
	const host = $derived(portalHost.current)

	function portalTo(target: HTMLElement) {
		return (wrapper: HTMLElement) => {
			target.appendChild(wrapper)
			// Svelte removes a branch's DOM by walking sibling nodes from the branch's own anchor, so
			// a wrapper moved out to the host is never reached and would outlive the component.
			return () => wrapper.remove()
		}
	}
</script>

{#if host}
	<div class="tl-portal-content" style="display: contents" {@attach portalTo(host)}>
		{@render children()}
	</div>
{/if}
