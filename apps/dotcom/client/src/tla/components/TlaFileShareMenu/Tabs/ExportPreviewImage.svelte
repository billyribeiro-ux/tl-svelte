<script lang="ts" module>
	import {
		Box,
		compact,
		debounce,
		type Editor,
		FileHelpers,
		type TLShape,
	} from 'svelte-draw'
	import type { SvelteDrawAppSessionState } from '../../../utils/local-session-state'
	import { getImageExportOptions } from './export-preferences'

	async function getEditorImage(
		editor: Editor,
		shapes: TLShape[],
		preferences: SvelteDrawAppSessionState['exportSettings'],
		cb: (info: { src: string; width: number; height: number }) => void
	) {
		const commonBounds = Box.Common(shapes.map((s) => editor.getShapePageBounds(s)!))

		// image max is 216x216, so let's say 500 to be nice and safe
		const scale = Math.min(500 / commonBounds.width, 500 / commonBounds.height)

		const result = await editor.toImage(shapes, {
			...getImageExportOptions(editor, preferences),
			scale,
			format: 'png',
		})

		if (!result) return

		const src = await FileHelpers.blobToDataUrl(result.blob)

		cb({ src, width: Math.ceil(result.width / scale), height: Math.ceil(result.height / scale) })
	}

	const getEditorImageSlowly = debounce(getEditorImage, 60)
</script>

<script lang="ts">
	import { untrack } from 'svelte'
	import { EffectScheduler, throttleToNextFrame } from 'svelte-draw'
	import { globalEditor } from '../../../../utils/globalEditor'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getExportPreferences } from './export-preferences'
	import styles from '../file-share-menu.module.css'

	const app = getMaybeApp()

	let imageElement = $state<HTMLImageElement | null>(null)
	let sizeElement = $state<HTMLDivElement | null>(null)

	// The reactor discards the effect's return value, so there is no cleanup closure: without a
	// sequence a slow earlier export lands after a quick later one.
	let renderSeq = 0

	// `useReactor` semantics: run now, then re-run at most once per animation frame when a signal
	// the function read changes.
	$effect(() => {
		let cancelFn: (() => void) | undefined
		const scheduler = new EffectScheduler(
			'update preview',
			() => {
				const seq = ++renderSeq

				const editor = globalEditor.get()
				if (!editor) return

				const preferences = getExportPreferences(app.current)

				// We need shapes here so that the reactor updates when selected shapes change
				let shapes = editor.getSelectedShapes()
				if (shapes.length === 0) {
					shapes = compact(
						editor
							.getSortedChildIdsForParent(editor.getCurrentPageId())
							.map((s) => editor.getShape(s))
					)
				}

				if (shapes.length === 0) {
					const elm = imageElement
					if (!elm) return
					elm.setAttribute('src', '')
					const sizeElm = sizeElement
					if (sizeElm) sizeElm.textContent = ''
					return
				}

				// while lots of shapes are selected, debounce a little so that the thread doesn't freeze when editing the page
				const fn = shapes.length > 20 ? getEditorImageSlowly : getEditorImage

				fn(editor, shapes, preferences, ({ src, width, height }) => {
					if (seq !== renderSeq) return
					const elm = imageElement
					if (!elm) return
					// We want to use an image element here so that a user can right click and copy / save / drag the preview
					elm.setAttribute('src', src)
					const sizeElm = sizeElement
					if (sizeElm) sizeElm.textContent = `${width.toFixed()}×${height.toFixed()}`
				})
			},
			{
				scheduleEffect: (cb) => {
					cancelFn = throttleToNextFrame(cb)
				},
			}
		)
		scheduler.attach()
		// Svelte must not track what the reactor reads; the reactor tracks it itself.
		untrack(() => scheduler.execute())
		return () => {
			scheduler.detach()
			cancelFn?.()
		}
	})

	// A debounced export still pending at unmount would otherwise run against a gone element
	$effect(() => () => getEditorImageSlowly.cancel())
</script>

<div class={styles.fileShareMenuExportPreview}>
	<!-- svelte-ignore a11y_missing_attribute -->
	<img bind:this={imageElement} class={styles.fileShareMenuExportPreviewInner} />
	<div
		bind:this={sizeElement}
		class={[styles.fileShareMenuExportPreviewSize, 'tla-text_ui__small']}
	></div>
</div>
