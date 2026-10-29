<script lang="ts" module>
	import type { Box } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiContextualToolbarProps {
		children?: Snippet
		class?: string
		isMousingDown?: boolean
		getSelectionBounds(): Box | undefined
		changeOnlyWhenYChanges?: boolean
		label: string
	}

	const HIDE_TOOLBAR_WHEN_CAMERA_IS_MOVING = false
</script>

<script lang="ts">
	import { assert, atom } from '@svelte-draw/editor'
	import {
		fromComputed,
		getEditor,
		quickReactor,
		usePassThroughWheelEvents,
	} from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { untrack } from 'svelte'
	import { useToolbarVisibilityStateMachine } from './contextualToolbarState.svelte'
	import { getToolbarScreenPosition } from './contextualToolbarUtils'
	import SvelteDrawUiToolbar from './SvelteDrawUiToolbar.svelte'

	/**
	 * A generic floating toolbar that can be used for things
	 * like rich text editing, image toolbars, etc.
	 *
	 * @public
	 */
	let {
		children,
		class: className,
		isMousingDown,
		getSelectionBounds,
		changeOnlyWhenYChanges = false,
		label,
	}: TLUiContextualToolbarProps = $props()

	const editor = getEditor()
	const passThroughWheelEvents = usePassThroughWheelEvents()

	let toolbarElm = $state<HTMLElement | null>(null)

	const machine = useToolbarVisibilityStateMachine(
		() => changeOnlyWhenYChanges,
		(next) => toolbarElm?.style.setProperty('transform', `translate(${next.x}px, ${next.y}px)`)
	)

	// we don't want the toolbar position function to depend on the Svelte state so we'll double with a plain variable
	let couldShowToolbar = false
	let hasValidToolbarPosition = $state(false)

	const contentSizeUpdateCounter = atom('content size update counter', 0)

	$effect(() => {
		const elm = toolbarElm
		assert(elm)
		const observer = new ResizeObserver(() => {
			contentSizeUpdateCounter.update((n) => n + 1)
		})
		observer.observe(elm)
		return () => observer.disconnect()
	})

	$effect(() => {
		const elm = toolbarElm
		const getBounds = getSelectionBounds
		let lastContentSizeUpdateCounter = contentSizeUpdateCounter.get()
		return quickReactor('toolbar position', function updateToolbarPositionAndDisplay() {
			untrack(() => {
				if (!elm) return

				// capture / force this to update when...
				editor.getCamera() // the camera moves
				const nextContentSizeUpdateCounter = contentSizeUpdateCounter.get() // the toolbar size changes

				// undefined here means that we can't show the toolbar due to an incompatible position
				const position = getToolbarScreenPosition(editor, elm, getBounds)

				// todo: when the toolbar is hidden due to the selection being off screen, it should be hidden immediately
				// rather than waiting for the position to settle. This is different than when the position changes due to
				// a change in the user's selection.
				if (!position) {
					if (couldShowToolbar) {
						// If we don't have a position, then we're not showing the toolbar
						couldShowToolbar = false
						hasValidToolbarPosition = false
					}
				} else {
					// If the camera state is moving, we want to immediately update the position
					// todo: consider hiding the toolbar while the camera is moving
					if (editor.getCameraState() === 'moving') {
						// ...if we wanted this to avoid prematurely updating any positions, we'd need
						// to have the last updated position in page space, so that we could convert
						// it to screen space and update it here
						elm.style.setProperty('transform', `translate(${position.x}px, ${position.y}px)`)
					} else {
						const moveImmediately = lastContentSizeUpdateCounter !== nextContentSizeUpdateCounter
						// Schedule a move to its next location
						machine.move(position.x, position.y, moveImmediately)
					}

					// Finally, if the toolbar was previously hidden, show it again
					if (!couldShowToolbar) {
						couldShowToolbar = true
						hasValidToolbarPosition = true
					}
				}

				lastContentSizeUpdateCounter = nextContentSizeUpdateCounter
			})
		})
	})

	const cameraState = fromComputed('camera state', () => editor.getCameraState())

	// Send the hide or show events based on whether the user is clicking
	// and whether the toolbar's position is valid
	$effect(() => {
		const moving = cameraState.current === 'moving'
		const mousingDown = isMousingDown
		const valid = hasValidToolbarPosition
		untrack(() => {
			if (moving && HIDE_TOOLBAR_WHEN_CAMERA_IS_MOVING) {
				machine.hide(true)
				return
			}

			if (mousingDown || !valid) {
				machine.hide()
				return
			}

			machine.show()
		})
	})

	// When the position changes, update the toolbar's position on screen
	$effect(() => {
		const next = machine.position
		toolbarElm?.style.setProperty('transform', `translate(${next.x}px, ${next.y}px)`)
	})
</script>

<!-- The handler only marks the event as handled for the editor. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={toolbarElm}
	{@attach passThroughWheelEvents}
	data-interactive={machine.isInteractive}
	data-visible={machine.isVisible}
	data-testid="contextual-toolbar"
	class={classNames('tlui-contextual-toolbar', className)}
	onpointerdown={editor.markEventAsHandled}
>
	<SvelteDrawUiToolbar orientation="horizontal" class="tlui-menu" {label} tooltipSide="top">
		{@render children?.()}
	</SvelteDrawUiToolbar>
</div>
