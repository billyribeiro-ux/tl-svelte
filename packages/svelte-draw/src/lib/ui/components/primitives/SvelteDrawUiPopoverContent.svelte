<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiPopoverContentProps {
		children: Snippet
		side: 'top' | 'bottom' | 'left' | 'right'
		align?: 'start' | 'center' | 'end'
		alignOffset?: number
		sideOffset?: number
		/**
		 * Minimum distance to keep between the popover and the viewport edge before it
		 * shifts to stay in view. Defaults to `0`.
		 */
		collisionPadding?: number
		disableEscapeKeyDown?: boolean
		autoFocusFirstButton?: boolean
	}
</script>

<script lang="ts">
	import { getContainer } from '@svelte-draw/svelte'
	import { Popover } from 'bits-ui'
	import { getContext } from 'svelte'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let {
		side,
		children,
		align = 'center',
		sideOffset = 8,
		alignOffset = 0,
		collisionPadding,
		disableEscapeKeyDown = false,
		autoFocusFirstButton = true,
	}: TLUiPopoverContentProps = $props()

	const container = getContainer()
	const dir = getDirection()
	let ref = $state<HTMLElement | null>(null)

	function handleOpenAutoFocus() {
		const contentId = ref?.id
		trigger = contentId
			? (ref?.ownerDocument.querySelector<HTMLElement>(`[aria-controls="${contentId}"]`) ?? null)
			: null
		if (!autoFocusFirstButton) return
		const buttons = (ref?.querySelectorAll('button:not([disabled])') ?? []) as NodeListOf<HTMLElement>
		const firstVisibleButton = [...buttons].find(
			(button) => button.offsetWidth || button.offsetHeight
		)
		firstVisibleButton?.focus()
	}

	// Radix dismissed on the outside pointerdown itself; bits-ui debounces it by 10ms, which leaves the
	// menu click capture overlay mounted over the canvas for the next click (e.g. a tool button click
	// followed at once by a click on the canvas would be swallowed). Close synchronously here; bits-ui's
	// own later dismissal is then a no-op.
	const closePopover = getContext<(() => void) | undefined>('svelte-draw-ui-popover-close')
	$effect(() => {
		const content = ref
		if (!content || !closePopover) return
		const doc = content.ownerDocument
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target
			if (!(target instanceof Element)) return
			if (content.contains(target)) return
			const trigger = content.id
				? doc.querySelector<HTMLElement>(`[aria-controls="${content.id}"]`)
				: null
			if (trigger?.contains(target)) return
			// Nested layers (menus, dialogs, other popovers) own their own dismissal.
			if (target.closest('[role="menu"], [role="dialog"], [role="listbox"], .tlui-popover__content')) return
			closePopover()
		}
		doc.addEventListener('pointerdown', onPointerDown, true)
		return () => doc.removeEventListener('pointerdown', onPointerDown, true)
	})

	// Radix returned focus to the trigger in a timeout; bits-ui does it in a microtask, i.e. before the
	// keypress of the Enter keydown that closed the menu, so that keypress would click the trigger and reopen it.
	// `ref` is already unmounted when the close handler runs, so the trigger is captured on open.
	let trigger: HTMLElement | null = null

	function handleCloseAutoFocus(e: Event) {
		if (!trigger?.isConnected) return
		e.preventDefault()
		const toFocus = trigger
		setTimeout(() => toFocus.focus(), 0)
	}
</script>

<Popover.Portal to={container}>
	<!-- Radix's non-modal popover never traps focus; bits-ui's trap refocuses the first button when a focused child unmounts (e.g. the page rename input), which then receives the Enter keypress. -->
	<Popover.Content
		bind:ref
		class="tlui-popover__content"
		{side}
		{sideOffset}
		{align}
		{alignOffset}
		{collisionPadding}
		dir={dir.current}
		trapFocus={false}
		onOpenAutoFocus={handleOpenAutoFocus}
		onCloseAutoFocus={handleCloseAutoFocus}
		onEscapeKeydown={(e) => {
			if (disableEscapeKeyDown) e.preventDefault()
		}}
	>
		{@render children()}
	</Popover.Content>
</Popover.Portal>
