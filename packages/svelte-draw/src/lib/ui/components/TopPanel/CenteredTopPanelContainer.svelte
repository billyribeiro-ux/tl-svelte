<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface CenteredTopPanelContainerProps {
		children?: Snippet
		maxWidth?: number
		ignoreRightWidth?: number
		stylePanelWidth?: number
		marginBetweenZones?: number
		squeezeAmount?: number
	}
</script>

<script lang="ts">
	import { getBreakpoint } from '../../context/breakpoints'

	let {
		maxWidth = 420,
		ignoreRightWidth = 0,
		stylePanelWidth = 148,
		marginBetweenZones = 12,
		squeezeAmount = 52,
		children,
	}: CenteredTopPanelContainerProps = $props()

	let element = $state<HTMLDivElement | null>(null)
	const breakpoint = getBreakpoint()

	function updateLayout(element: HTMLDivElement) {
		const layoutTop = element.parentElement!.parentElement!
		const leftPanel = layoutTop.querySelector('.tlui-layout__top__left')! as HTMLElement
		const rightPanel = layoutTop.querySelector('.tlui-layout__top__right')! as HTMLElement

		const totalWidth = layoutTop.offsetWidth
		const leftWidth = leftPanel.offsetWidth
		const rightWidth = rightPanel.offsetWidth

		// Ignore button width
		const selfWidth = element.offsetWidth - ignoreRightWidth

		let xCoordIfCentered = (totalWidth - selfWidth) / 2

		// Prevent subpixel bullsh
		if (totalWidth % 2 !== 0) {
			xCoordIfCentered -= 0.5
		}

		const xCoordIfLeftAligned = leftWidth + marginBetweenZones

		const left = element.offsetLeft
		const maxWidthProperty = Math.min(
			totalWidth - rightWidth - leftWidth - 2 * marginBetweenZones,
			maxWidth
		)
		const xCoord = Math.max(xCoordIfCentered, xCoordIfLeftAligned) - left

		// Squeeze the title if the right panel is too wide on small screens
		if (rightPanel.offsetWidth > stylePanelWidth && breakpoint.current <= 6) {
			element.style.setProperty('max-width', maxWidthProperty - squeezeAmount + 'px')
		} else {
			element.style.setProperty('max-width', maxWidthProperty + 'px')
		}
		element.style.setProperty('transform', `translate(${xCoord}px, 0px)`)
	}

	// Re-runs when the breakpoint or any layout prop changes (updateLayout reads them), like the
	// React effect that depended on the memoized updateLayout.
	$effect(() => {
		const elm = element
		if (!elm) return

		const layoutTop = elm.parentElement!.parentElement!
		const leftPanel = layoutTop.querySelector('.tlui-layout__top__left')! as HTMLElement
		const rightPanel = layoutTop.querySelector('.tlui-layout__top__right')! as HTMLElement

		const update = () => updateLayout(elm)

		// Update layout when the things change
		const observer = new ResizeObserver(update)
		observer.observe(leftPanel)
		observer.observe(rightPanel)
		observer.observe(layoutTop)
		observer.observe(elm)

		// React also re-ran the layout after every render; a Svelte component has no such hook, so
		// content changes inside the container trigger it instead.
		const mutationObserver = new MutationObserver(update)
		mutationObserver.observe(elm, { childList: true, subtree: true, characterData: true })

		// Also update on first layout
		update()

		return () => {
			observer.disconnect()
			mutationObserver.disconnect()
		}
	})
</script>

<div bind:this={element} class="tlui-top-panel__container">
	{@render children?.()}
</div>
