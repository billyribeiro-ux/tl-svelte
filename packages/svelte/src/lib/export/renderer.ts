import type { SvgExportRenderer } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import SvgExportTree from './SvgExportTree.svelte'

/**
 * Renders an SVG export scene with Svelte: mounts the export tree into the off-screen target with
 * `mount()` and applies updates synchronously with `flushSync()`. Register it with
 * `registerSvgExportRenderer(svelteSvgExportRenderer)` or the `svgExportRenderer` editor option.
 */
export const svelteSvgExportRenderer: SvgExportRenderer = {
	render(scene, target) {
		const app = mount(SvgExportTree, { target, props: { scene } })
		// run the tree's effects now, so the scene subscription is live before the editor
		// publishes the prepared shapes
		flushSync()
		return {
			flush: () => flushSync(),
			unmount: () => {
				void unmount(app)
			},
		}
	},
}
