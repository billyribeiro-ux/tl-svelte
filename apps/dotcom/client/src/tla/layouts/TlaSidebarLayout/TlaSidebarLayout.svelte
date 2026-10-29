<script lang="ts">
	import type { Snippet } from 'svelte'
	import { clamp, quickReactor, tltime, useGlobalMenuIsOpen } from 'svelte-draw'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { setupPreventAccidentalDrops } from '../../hooks/usePreventAccidentalDrops.svelte'
	import TlaSidebar from '../../components/TlaSidebar/TlaSidebar.svelte'
	import TlaSidebarToggle from '../../components/TlaSidebar/components/TlaSidebarToggle.svelte'
	import TlaSidebarToggleMobile from '../../components/TlaSidebar/components/TlaSidebarToggleMobile.svelte'
	import {
		getLocalSessionState,
		getLocalSessionStateUnsafe,
		isSidebarOpen,
		isSidebarOpenMobile,
		toggleSidebar,
		updateLocalSessionState,
	} from '../../utils/local-session-state'
	import styles from './sidebar-layout.module.css'

	const MIN_SIDEBAR_WIDTH = 150
	const DEF_SIDEBAR_WIDTH = 260
	const MAX_SIDEBAR_WIDTH = 500

	let {
		isEmbed,
		children,
	}: {
		isEmbed?: boolean
		children: Snippet
		collapsible?: boolean
	} = $props()

	// The layout mounts while the app is still preloading so the file sync host under it keeps
	// its socket across the app arriving; the sidebar itself needs Zero data, so its column stays
	// empty until then.
	const app = getMaybeApp()
	// Must match the stable id used by TlaSidebarWorkspaceSwitcher (see note there).
	const workspaceSwitcherMenu = useGlobalMenuIsOpen('sidebar-workspace-switcher')

	setupPreventAccidentalDrops()

	let layoutContainer: HTMLDivElement | null = null

	// When the local session state sidebar width changes, update the sidebar element's width.
	// quickReactor runs `fn` immediately and synchronously on every change, so attaching it also
	// applies the width once on mount: before first paint, which is what avoids a flicker when
	// the width is not the default.
	function trackSidebarWidth(el: HTMLDivElement) {
		layoutContainer = el
		const stop = quickReactor('update sidebar width', () => {
			const width = getLocalSessionState().sidebarWidth
			if (typeof width !== 'number') return
			el.style.setProperty('--tla-sidebar-width', `${width}px`)
		})
		return () => {
			stop()
			if (layoutContainer === el) layoutContainer = null
		}
	}

	let resizeState:
		| { name: 'idle' }
		| { name: 'pointing'; startWidth: number; startX: number }
		| { name: 'resizing'; startWidth: number; startX: number }
		| { name: 'closing' } = { name: 'idle' }

	// The original React handlers neither stopped propagation nor marked the event handled, so
	// Svelte's delegated `onpointerdown` / `onpointermove` / `ondblclick` (which run at the app
	// root, after native listeners) behave the same here. `lostpointercapture` is not delegated.
	function handlePointerDown(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement
		// start pointing
		target.setPointerCapture(event.pointerId)

		// Get the current sidebar width as its start width
		const startWidth = layoutContainer
			? parseInt(getComputedStyle(layoutContainer).getPropertyValue('--tla-sidebar-width'), 10)
			: 0

		resizeState = { name: 'pointing', startX: event.clientX, startWidth }
	}

	function handlePointerMove(moveEvent: PointerEvent) {
		if (resizeState.name === 'idle') return

		if (resizeState.name === 'pointing') {
			if (Math.abs(moveEvent.clientX - resizeState.startX) < 5) return // not resizing yet...

			// start resizing
			resizeState = { ...resizeState, name: 'resizing' }
			layoutContainer?.setAttribute('data-resizing', 'true')
		}

		if (resizeState.name === 'resizing') {
			const { startX, startWidth } = resizeState
			const direction = getComputedStyle(layoutContainer ?? document.documentElement).direction
			const deltaX = moveEvent.clientX - startX
			const widthDelta = direction === 'rtl' ? -deltaX : deltaX

			const newWidth = Math.floor(
				clamp(startWidth + widthDelta, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH)
			)

			if (newWidth !== getLocalSessionStateUnsafe().sidebarWidth) {
				// Update local sidebar width
				updateLocalSessionState(() => ({ sidebarWidth: newWidth }))
			}
		}
	}

	let timeout: ReturnType<typeof tltime.setTimeout> | undefined

	function handlePointerUp(event: PointerEvent) {
		// regardless of whether we're in pointing or resizing, remove capture and the resizing attribute
		const target = event.currentTarget as HTMLElement
		// Safe when the capture is already gone (this also runs from `lostpointercapture`).
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)

		if (resizeState.name === 'idle') return

		if (resizeState.name === 'resizing') {
			// we're done, go to idle
			resizeState = { name: 'idle' }
			layoutContainer?.removeAttribute('data-resizing')
		}

		function closeSidebar() {
			toggleSidebar(false)
			layoutContainer?.removeAttribute('data-resizing')
			resizeState = { name: 'idle' }
		}

		if (resizeState.name === 'pointing') {
			// if the menu is at its default size, close it
			if (getLocalSessionStateUnsafe().sidebarWidth === DEF_SIDEBAR_WIDTH) {
				closeSidebar()
				return
			}

			// if it's been resized, the user might be double clicking to reset its width
			resizeState = { name: 'closing' }
			timeout = tltime.setTimeout(
				'close sidebar on click if not a double click',
				() => {
					// close the menu after 200ms unless a double click happens
					if (resizeState.name === 'closing') {
						closeSidebar()
					}
				},
				200
			)
			return
		}
	}

	function handleDoubleClick() {
		// reset the sidebar width to its default width on double click

		// cancel the "close sidebar on click if not a double click" timeout since its a double click
		clearTimeout(timeout as unknown as number)

		// prevent animation by adding resizing and then removing it after a moment
		layoutContainer?.setAttribute('data-resizing', 'true')
		timeout = tltime.setTimeout(
			'sidebar resizing variable after animation ends',
			() => layoutContainer?.removeAttribute('data-resizing'),
			200
		)

		// resize and return to idle
		updateLocalSessionState(() => ({ sidebarWidth: DEF_SIDEBAR_WIDTH }))
		resizeState = { name: 'idle' }
	}
</script>

<div
	{@attach trackSidebarWidth}
	class={styles.layout}
	data-sidebar={!isEmbed && isSidebarOpen.current}
	data-sidebarmobile={!isEmbed && isSidebarOpenMobile.current}
	data-testid="tla-sidebar-layout"
>
	{#if isEmbed}
		{@render children()}
	{:else}
		{#if app.current}<TlaSidebar />{/if}
		{@render children()}
		<div class={styles.toggleContainer}>
			<TlaSidebarToggle />
			<TlaSidebarToggleMobile />
		</div>
		{#if isSidebarOpen.current && !workspaceSwitcherMenu.isOpen}
			<div
				class={styles.resizeHandle}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				draggable={false}
				ondblclick={handleDoubleClick}
				onlostpointercapture={handlePointerUp}
				role="separator"
				aria-orientation="vertical"
			>
				<div class={styles.resizeHandleIndicator}></div>
			</div>
		{/if}
	{/if}
</div>
