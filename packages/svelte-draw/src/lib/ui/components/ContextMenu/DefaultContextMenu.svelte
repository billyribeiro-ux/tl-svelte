<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiContextMenuProps {
		children?: Snippet
		disabled?: boolean
	}

	const messages = defineMessages({
		contextMenuTitle: { id: 'context-menu.title', defaultMessage: 'Context menu' },
	})
</script>

<script lang="ts">
	import { preventDefault } from '@svelte-draw/editor'
	import { fromComputed, getContainer, getEditor, getEditorComponents } from '@svelte-draw/svelte'
	import { ContextMenu } from 'bits-ui'
	import { getContextMenuPagePoint } from '../../context'
	import { createMenuIsOpen } from '../../hooks/useMenuIsOpen'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import DefaultContextMenuContent from './DefaultContextMenuContent.svelte'

	let { children, disabled = false }: TLUiContextMenuProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const container = getContainer()
	const dir = getDirection()
	const components = getEditorComponents()

	// The context menu opens from a right-click in any tool, and from a touch
	// long-press only in the select tool (where it acts on the selection). A
	// right-click (fine pointer) is routed through the select tool by the editor; a
	// long-press in any other tool belongs to that tool's gesture (creating, erasing,
	// drawing, panning), so it opens nothing.
	//
	// The right-click case keys off the pointer type, not the tool, on purpose: a
	// right-click switches to select synchronously within the same gesture, so gating
	// it on the tool would race the render and wrongly suppress the menu. The
	// select-tool long-press case is safe to gate on the tool — a long-press never
	// switches tools, so there is nothing to race.
	const menuCanOpen = fromComputed(
		'context menu can open',
		() => !editor.getInstanceState().isCoarsePointer || editor.isIn('select')
	)

	// When hitting `Escape` while the context menu is open, we want to prevent
	// the default behavior of losing focus on the shape. Otherwise,
	// it's pretty annoying from an accessibility perspective.
	//
	// This listens on the body in the capture phase, so it must NOT stop the event: Radix closed the
	// menu from its own document-level *capture* listener, which ran before this one. bits-ui's
	// escape layer listens on the document in the *bubble* phase, so stopping propagation here would
	// keep the event from ever reaching it and Escape would never close the menu.
	function preventEscapeFromLosingShapeFocus(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			editor.getContainer().focus()
		}
	}

	$effect(() => {
		const body = editor.getContainerDocument().body
		return () => {
			body.removeEventListener('keydown', preventEscapeFromLosingShapeFocus, {
				capture: true,
			})
		}
	})

	// On touch devices, the same touch that triggers the long-press open is still
	// down when the menu mounts. The release fires events the dismissable layer treats
	// as an outside interaction and closes the menu. We swallow dismissals during a
	// short grace window after open so the menu stays put until the user actually
	// interacts again.
	let suppressDismissUntil = 0
	function suppressDismissDuringGrace(e: Event) {
		if (Date.now() < suppressDismissUntil) e.preventDefault()
	}

	const rContextMenuPagePoint = getContextMenuPagePoint()

	function onOpenChangeCallback(isOpen: boolean) {
		const body = editor.getContainerDocument().body
		rContextMenuPagePoint.current = isOpen ? editor.inputs.getCurrentPagePoint().clone() : null
		if (!isOpen) {
			const onlySelectedShape = editor.getOnlySelectedShape()

			if (onlySelectedShape && editor.isShapeOrAncestorLocked(onlySelectedShape)) {
				editor.setSelectedShapes([])
			}

			editor.timers.requestAnimationFrame(() => {
				body.removeEventListener('keydown', preventEscapeFromLosingShapeFocus, {
					capture: true,
				})
			})
		} else {
			body.addEventListener('keydown', preventEscapeFromLosingShapeFocus, {
				capture: true,
			})

			if (editor.getInstanceState().isCoarsePointer) {
				suppressDismissUntil = Date.now() + 500

				// Weird route: selecting locked shapes on long press
				const selectedShapes = editor.getSelectedShapes()
				// get all of the shapes under the current pointer
				const shapesAtPoint = editor.getShapesAtPoint(editor.inputs.getCurrentPagePoint())

				// if there are no selected shapes
				// OR if none of the shapes at the point include the selected shape
				if (!selectedShapes.length || !shapesAtPoint.some((s) => selectedShapes.includes(s))) {
					// then are there any locked shapes under the current pointer?
					const lockedShapes = shapesAtPoint.filter((s) => editor.isShapeOrAncestorLocked(s))

					if (lockedShapes.length) {
						// nice, let's select them
						editor.select(...lockedShapes.map((s) => s.id))
					}
				}
			}
		}
	}

	const menu = createMenuIsOpen('context menu', onOpenChangeCallback)

	const Canvas = $derived(components.Canvas)

	let contentRef = $state<HTMLElement | null>(null)

	// Radix dismissed on a pointerdown of any button outside the menu. bits-ui ignores non-primary
	// buttons (it leaves a right-click to the trigger's contextmenu event), so a right-button drag
	// started with the menu open would never close it. This listens in the bubble phase: closing the
	// menu unmounts MenuClickCapture (and its listeners) on the next microtask, which would otherwise
	// run before that overlay forwards this very pointerdown to the canvas.
	$effect(() => {
		if (!menu.isOpen) return
		const doc = editor.getContainerDocument()
		function closeOnSecondaryPointerDownOutside(e: PointerEvent) {
			if (e.button === 0) return
			if (contentRef && e.target instanceof Node && contentRef.contains(e.target)) return
			menu.onOpenChange(false)
		}
		doc.addEventListener('pointerdown', closeOnSecondaryPointerDownOutside)
		return () => doc.removeEventListener('pointerdown', closeOnSecondaryPointerDownOutside)
	})
</script>

<!--
	Controlled `open`: svelte-draw can close the menu itself (MenuClickCapture's clearOpenMenus),
	so the open state lives in the global menu state, not in the primitive.
-->
<ContextMenu.Root
	bind:open={() => menu.isOpen, (value) => menu.onOpenChange(value)}
	dir={dir.current}
>
	<ContextMenu.Trigger
		dir="ltr"
		disabled={disabled || !menuCanOpen.current}
		oncontextmenu={
			// When suppressed, disabling the trigger stops the primitive from opening the
			// menu, but it also stops it from preventing the native contextmenu — so
			// prevent the browser's own menu ourselves in that case.
			menuCanOpen.current ? undefined : preventDefault
		}
	>
		{#snippet child({ props })}
			<!-- bits-ui makes the trigger focusable (tabindex -1), which would take focus from the editor container when the canvas is clicked; Radix's trigger was not focusable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<span {...props} tabindex={undefined}>
				{#if Canvas}
					<Canvas />
				{/if}
			</span>
		{/snippet}
	</ContextMenu.Trigger>
	{#if menu.isOpen}
		<ContextMenu.Portal to={container}>
			<ContextMenu.Content
				bind:ref={contentRef}
				class="tlui-menu tlui-scrollable"
				data-testid="context-menu"
				aria-label={msg(messages.contextMenuTitle)}
				alignOffset={-4}
				collisionPadding={4}
				preventScroll={false}
				oncontextmenu={preventDefault}
				onInteractOutside={suppressDismissDuringGrace}
				onFocusOutside={suppressDismissDuringGrace}
			>
				<SvelteDrawUiMenuContextProvider type="context-menu" sourceId="context-menu">
					<!-- If there's no menu content, then the user has set it to null, so skip rendering the menu. -->
					{#if children}
						{@render children()}
					{:else}
						<DefaultContextMenuContent />
					{/if}
				</SvelteDrawUiMenuContextProvider>
			</ContextMenu.Content>
		</ContextMenu.Portal>
	{/if}
</ContextMenu.Root>
