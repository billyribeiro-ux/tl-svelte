<script lang="ts">
	import { getEditor, quickReactor } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'

	const editor = getEditor()

	// [1]
	const clip: Attachment<HTMLDivElement> = (elm) =>
		quickReactor('clip', () => {
			const rotation = editor.getSelectionRotation()
			const box = editor.getSelectionRotatedScreenBounds()

			if (!box) {
				elm.style.clipPath = ''
				return
			}

			// [2]
			const vsb = editor.getViewportScreenBounds()
			const { corners } = box.clone().translate(vsb.point.clone().neg()).expandBy(20)
			const [tl, tr, br, bl] = corners.map((p) => p.rotWith(box.point, rotation))

			// [3]
			elm.style.clipPath = `polygon(0% 0%, ${tl.x}px 0%, ${tl.x}px ${tl.y}px, ${bl.x}px ${bl.y}px, ${br.x}px ${br.y}px, ${tr.x}px ${tr.y}px, ${tl.x}px ${tl.y}px, ${tl.x}px 0%, 100% 0%, 100% 100%, 0% 100%)`
		})
</script>

<div {@attach clip} class="mask-fg"></div>

<!--
[1]
`quickReactor` re-runs synchronously whenever the selection or camera changes, and writes
straight to the element's style, so the mask never lags a frame behind the selection.

[2]
`getSelectionRotatedScreenBounds` is in screen space relative to the page, so it is offset by
the viewport's screen position to get coordinates relative to the overlay element. The
corners are then rotated to match the selection's rotation.

[3]
CSS `clip-path` has no "everything except this" mode, so the polygon traces the outer edge of
the overlay, dips in to wind around the selection rectangle, and comes back out. The wound
region ends up outside the polygon and is therefore transparent.
-->
