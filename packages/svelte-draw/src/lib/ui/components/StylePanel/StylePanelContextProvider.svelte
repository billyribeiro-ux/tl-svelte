<script lang="ts" module>
	import type { ReadonlySharedStyleMap } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface StylePanelContextProviderProps {
		children: Snippet
		styles: ReadonlySharedStyleMap
	}
</script>

<script lang="ts">
	import { unsafe__withoutCapture, type StyleProp } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { setStylePanelContext } from './StylePanelContext'

	let { children, styles }: StylePanelContextProviderProps = $props()

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const enhancedA11yMode = fromComputed('enhancedA11yMode', () =>
		editor.user.getEnhancedA11yMode()
	)

	setStylePanelContext({
		get styles() {
			return styles
		},
		get enhancedA11yMode() {
			return enhancedA11yMode.current
		},
		onHistoryMark: (id: string) => editor.markHistoryStoppingPoint(id),
		onValueChange<T>(style: StyleProp<T>, value: T) {
			// If the user is holding down the accelerator key (Ctrl on Windows/Linux, Cmd on Mac)
			// while shapes are selected, interpret that as a wish to change the style for their
			// current selected shapes but not for the next shapes.
			const skipNextShapeStyle = unsafe__withoutCapture(
				() => editor.getSelectedShapeIds().length > 0 && editor.inputs.getAccelKey()
			)
			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setStyleForSelectedShapes(style, value)
				}
				if (!skipNextShapeStyle) {
					editor.setStyleForNextShapes(style, value)
				}
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', { source: 'style-panel', id: style.id, value: value as string })
		},
		onOpacityChange(opacity: number) {
			const skipNextShapeStyle = unsafe__withoutCapture(
				() => editor.getSelectedShapeIds().length > 0 && editor.inputs.getAccelKey()
			)

			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setOpacityForSelectedShapes(opacity)
				}
				if (!skipNextShapeStyle) {
					editor.setOpacityForNextShapes(opacity)
				}
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', { source: 'style-panel', id: 'opacity', value: opacity })
		},
	})
</script>

{@render children()}
