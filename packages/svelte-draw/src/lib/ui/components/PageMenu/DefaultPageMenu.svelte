<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		pageMenuNewPageInitialName: { id: 'page-menu.new-page-initial-name', defaultMessage: 'Page 1' },
		actionRename: { id: 'action.rename', defaultMessage: 'Rename' },
		contextMenuReorder: { id: 'context-menu.reorder', defaultMessage: 'Reorder' },
		pageMenuCreateNewPage: { id: 'page-menu.create-new-page', defaultMessage: 'Create new page' },
		pageMenuGoToPage: { id: 'page-menu.go-to-page', defaultMessage: 'Go to page' },
		pageMenuMaxPagesReached: {
			id: 'page-menu.max-pages-reached',
			defaultMessage: 'Maximum pages reached',
		},
		pageMenuResize: { id: 'page-menu.resize', defaultMessage: 'Resize page list' },
	})

	const PAGE_MENU_LIST_HEIGHT_KEY = 'svelteDraw_page_menu_list_height'
	const MAX_PAGE_MENU_RENDER_HEIGHT = 800
	const LIST_BOTTOM_PADDING = 4
	const MAX_PAGE_MENU_AVAILABLE_HEIGHT_RATIO = 0.62
	const PAGE_MENU_CREATE_BUTTON_HEIGHT = 40
	const PAGE_MENU_RESIZE_HANDLE_HEIGHT = 1
	const PAGE_MENU_ITEM_HEIGHT = 36
	const MIN_PAGE_MENU_LIST_HEIGHT = PAGE_MENU_ITEM_HEIGHT + LIST_BOTTOM_PADDING
	const PAGE_MENU_DRAG_THRESHOLD = 5
	const PAGE_MENU_AUTO_SCROLL_ZONE = 16
	const PAGE_MENU_AUTO_SCROLL_RAMP_DISTANCE = 48
	const PAGE_MENU_MIN_AUTO_SCROLL_SPEED = 1
	const PAGE_MENU_MAX_AUTO_SCROLL_SPEED = 6

	function readSavedPageMenuListHeight(): number | null {
		if (typeof window === 'undefined') return null
		try {
			const raw = window.localStorage.getItem(PAGE_MENU_LIST_HEIGHT_KEY)
			if (!raw) return null
			const n = Number(raw)
			return Number.isFinite(n) && n >= MIN_PAGE_MENU_LIST_HEIGHT ? n : null
		} catch {
			return null
		}
	}

	function getPageMenuRenderCap(availableHeight: number): number {
		const maxMenuHeight = Math.min(
			MAX_PAGE_MENU_RENDER_HEIGHT,
			availableHeight * MAX_PAGE_MENU_AVAILABLE_HEIGHT_RATIO
		)
		const footerHeight = PAGE_MENU_CREATE_BUTTON_HEIGHT + PAGE_MENU_RESIZE_HANDLE_HEIGHT
		return Math.max(MIN_PAGE_MENU_LIST_HEIGHT, maxMenuHeight - footerHeight)
	}

	function getPageMenuAutoFitListHeight(pageCount: number): number {
		return Math.max(
			MIN_PAGE_MENU_LIST_HEIGHT,
			pageCount * PAGE_MENU_ITEM_HEIGHT + LIST_BOTTOM_PADDING
		)
	}
</script>

<script lang="ts">
	import {
		clamp,
		PageRecordType,
		releasePointerCapture,
		setPointerCapture,
		type TLPageId,
	} from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { nativeEvents } from '../../../shapes/shared/nativeEvents'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getUiEvents } from '../../context/events'
	import { createMenuIsOpen } from '../../hooks/useMenuIsOpen'
	import { createReadonly } from '../../hooks/useReadonly'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiButtonLabel from '../primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiPopover from '../primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from '../primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from '../primitives/SvelteDrawUiPopoverTrigger.svelte'
	import { onMovePage } from './edit-pages-shared'
	import PageItemInput from './PageItemInput.svelte'
	import PageItemSubmenu from './PageItemSubmenu.svelte'

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const msg = getTranslation()
	const breakpoint = getBreakpoint()

	// The id of the page currently being renamed inline, if any.
	let editingPageId = $state<TLPageId | null>(null)

	function closePageItemSubmenus(exceptIndex?: number) {
		const contextSuffix = `-${editor.contextId}`
		for (const menuId of editor.menus.getOpenMenus()) {
			const id = menuId.endsWith(contextSuffix) ? menuId.slice(0, -contextSuffix.length) : menuId
			if (!id.startsWith('page item submenu ')) continue
			if (exceptIndex !== undefined && id === `page item submenu ${exceptIndex}`) continue
			editor.menus.deleteOpenMenu(id)
		}
	}

	function handleOpenChange(isOpen: boolean) {
		editingPageId = null
		if (!isOpen) {
			closePageItemSubmenus()
		}
	}

	const pageMenu = createMenuIsOpen('page-menu', handleOpenChange)

	let sortableContainer = $state<HTMLDivElement | null>(null)

	const pages = fromComputed('pages', () => editor.getPages())
	const currentPage = fromComputed('currentPage', () => editor.getCurrentPage())
	const isReadonlyMode = createReadonly()
	const isCoarsePointer = fromComputed('isCoarsePointer', () => editor.getInstanceState().isCoarsePointer)

	// null = auto-fit to the number of pages (capped). A number means the user
	// has pinned the list to that height via the resize handle.
	let userListHeight = $state<number | null>(readSavedPageMenuListHeight())
	let isResizing = $state(false)
	let availableHeight = $state(typeof window === 'undefined' ? 800 : window.innerHeight)

	function updateAvailableHeight() {
		if (typeof window === 'undefined') return

		const popoverContent = sortableContainer?.closest<HTMLElement>('.tlui-popover__content')
		// bits-ui exposes the available height under its own prefix (Radix used `--radix-popover-...`).
		const popoverAvailableHeight = popoverContent
			? Number.parseFloat(
					getComputedStyle(popoverContent).getPropertyValue('--bits-popover-content-available-height')
				)
			: NaN

		availableHeight = Number.isFinite(popoverAvailableHeight)
			? popoverAvailableHeight
			: window.innerHeight
	}

	$effect(() => {
		if (!pageMenu.isOpen) return
		editor.timers.requestAnimationFrame(updateAvailableHeight)
	})

	const renderCap = $derived(getPageMenuRenderCap(availableHeight))
	const autoFitListHeight = $derived(getPageMenuAutoFitListHeight(pages.current.length))
	const renderedListHeight = $derived(Math.min(userListHeight ?? autoFitListHeight, renderCap))
	const hasReachedMaxPages = $derived(pages.current.length >= editor.options.maxPages)
	const createPageButtonLabel = $derived(
		msg(hasReachedMaxPages ? messages.pageMenuMaxPagesReached : messages.pageMenuCreateNewPage)
	)

	function handleResizePointerDown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault()
		const handle = e.currentTarget
		handle.setPointerCapture(e.pointerId)
		const startY = e.clientY
		// Start the drag from what the user currently sees, so the divider
		// tracks the cursor even when the stored preference exceeds the cap.
		const startHeight = handle.previousElementSibling?.getBoundingClientRect().height ?? 0
		let nextHeight = startHeight

		isResizing = true

		const onMove = (moveEvent: PointerEvent) => {
			nextHeight = Math.max(MIN_PAGE_MENU_LIST_HEIGHT, startHeight + (moveEvent.clientY - startY))
			userListHeight = nextHeight
		}

		const onUp = () => {
			handle.removeEventListener('pointermove', onMove)
			handle.removeEventListener('pointerup', onUp)
			handle.removeEventListener('pointercancel', onUp)
			isResizing = false
			try {
				window.localStorage.setItem(PAGE_MENU_LIST_HEIGHT_KEY, String(nextHeight))
			} catch {
				// ignore — storage may be unavailable in private/embedded contexts
			}
		}

		handle.addEventListener('pointermove', onMove)
		handle.addEventListener('pointerup', onUp, { once: true })
		handle.addEventListener('pointercancel', onUp, { once: true })
	}

	function handleResizeDoubleClick() {
		userListHeight = null
		try {
			window.localStorage.removeItem(PAGE_MENU_LIST_HEIGHT_KEY)
		} catch {
			// ignore — storage may be unavailable in private/embedded contexts
		}
	}

	$effect(function closePageMenuOnEnterPressAfterPressingEnterToConfirmRename() {
		const doc = editor.getContainerDocument()
		const editing = editingPageId
		function handleKeyDown() {
			if (editing) return
			if (doc.activeElement === doc.body) {
				editor.menus.clearOpenMenus()
			}
		}

		doc.addEventListener('keydown', handleKeyDown, { passive: true })
		return () => {
			doc.removeEventListener('keydown', handleKeyDown)
		}
	})

	const mut = {
		status: 'idle' as 'idle' | 'pointing' | 'dragging',
		id: null as TLPageId | null,
		startIndex: 0,
		dragIndex: 0,
		startY: 0,
		startScrollTop: 0,
		lastClientY: 0,
		// Set true when a drag ends, whether dropped or cancelled with Escape,
		// so the click that follows the release doesn't also navigate to the
		// dragged page. Cleared on pointer down: a release over another row
		// gets no click, and a stale flag would swallow the next click.
		justDragged: false,
		startedOnDragHandle: false,
		// Whether an auto-scroll rAF is in flight; the loop reschedules itself
		// while status === 'dragging' and exits otherwise.
		autoScrollScheduled: false,
	}

	// The single source of truth for an in-progress drag. Null when idle.
	// Other rows' positions are derived from startIndex/dragIndex during render.
	let dragState = $state.raw<{
		id: TLPageId
		startIndex: number
		dragIndex: number
		offsetY: number
	} | null>(null)

	// Scroll the current page into view when the menu opens / when current page changes.
	// Rows are absolutely positioned at top:0 and translated via transform, so
	// `offsetTop` is always 0 — derive the row's visual position from its index.
	// A derived id (not `currentPage.current.id` in the effect): renaming replaces the page record, and
	// re-running the effect would re-focus the page button right after Enter confirmed the rename.
	const currentPageId = $derived(currentPage.current.id)
	$effect(() => {
		if (!pageMenu.isOpen) return
		const id = currentPageId
		editor.timers.requestAnimationFrame(() => {
			const container = sortableContainer
			if (!container) return
			const currentIndex = editor.getPages().findIndex((p) => p.id === id)
			if (currentIndex === -1) return

			const doc = editor.getContainerDocument()
			const elm = doc.querySelector(`[data-pageid="${id}"]`) as HTMLDivElement | null
			elm?.querySelector<HTMLButtonElement>('button.tlui-page-menu__item__button')?.focus()

			const elmTop = currentIndex * PAGE_MENU_ITEM_HEIGHT
			const elmBottom = elmTop + PAGE_MENU_ITEM_HEIGHT
			const viewTop = container.scrollTop
			const viewBottom = viewTop + container.clientHeight
			if (elmTop < viewTop) {
				container.scrollTo({ top: elmTop })
			} else if (elmBottom > viewBottom) {
				container.scrollTo({ top: elmBottom - container.clientHeight })
			}
		})
	})

	// Recomputes the dragged row's offset and dragIndex from the current
	// pointer position and container scrollTop, then publishes the new
	// dragState so the rest of the rows shift around it.
	function updateDragFromPointer(clientY: number) {
		if (mut.status !== 'dragging' || !mut.id) return
		const pageCount = pages.current.length
		const scrollTop = sortableContainer?.scrollTop ?? 0
		// Offsets the cursor delta by any auto-scroll that has happened
		// since the drag started, so the row tracks the cursor as the
		// list scrolls underneath it.
		const rawOffsetY = clientY - mut.startY + (scrollTop - mut.startScrollTop)
		// Clamp the dragged row's visible position to the first/last slot
		// so its transform never extends the popover scroll area.
		const maxDragY = (pageCount - 1) * PAGE_MENU_ITEM_HEIGHT
		const dragY = clamp(mut.startIndex * PAGE_MENU_ITEM_HEIGHT + rawOffsetY, 0, maxDragY)
		const offsetY = dragY - mut.startIndex * PAGE_MENU_ITEM_HEIGHT
		const dragIndex = clamp(Math.round(dragY / PAGE_MENU_ITEM_HEIGHT), 0, pageCount - 1)
		mut.dragIndex = dragIndex
		mut.lastClientY = clientY
		dragState = { id: mut.id, startIndex: mut.startIndex, dragIndex, offsetY }
	}

	// During a drag, the list should only scroll from the auto-scroll loop
	// below. Native wheel/trackpad scroll would fight the drag position.
	const blockWheelWhileDragging = nativeEvents<HTMLDivElement>(
		{
			wheel(e) {
				if (mut.status !== 'dragging') return
				e.preventDefault()
			},
		},
		{ passive: false }
	)

	function tickAutoScrollDuringDrag() {
		const container = sortableContainer
		if (mut.status !== 'dragging' || !container) {
			mut.autoScrollScheduled = false
			return
		}
		const rect = container.getBoundingClientRect()
		const fromTop = mut.lastClientY - rect.top
		const fromBottom = rect.bottom - mut.lastClientY
		const maxScroll = container.scrollHeight - container.clientHeight
		// During a drag, scroll speed ramps up as the pointer approaches and
		// passes the edge of the scroll container.
		// `overshoot` is 0 at the inner edge of PAGE_MENU_AUTO_SCROLL_ZONE and grows
		// as the cursor approaches and passes the edge of the container.
		const overshootTop = PAGE_MENU_AUTO_SCROLL_ZONE - fromTop
		const overshootBottom = PAGE_MENU_AUTO_SCROLL_ZONE - fromBottom
		let overshoot = 0
		let direction = 0
		if (overshootTop > 0 && container.scrollTop > 0) {
			overshoot = overshootTop
			direction = -1
		} else if (overshootBottom > 0 && container.scrollTop < maxScroll) {
			overshoot = overshootBottom
			direction = 1
		}
		if (direction !== 0) {
			const t = Math.min(1, overshoot / PAGE_MENU_AUTO_SCROLL_RAMP_DISTANCE)
			const speed =
				PAGE_MENU_MIN_AUTO_SCROLL_SPEED +
				(PAGE_MENU_MAX_AUTO_SCROLL_SPEED - PAGE_MENU_MIN_AUTO_SCROLL_SPEED) * t
			const before = container.scrollTop
			container.scrollTop = clamp(before + direction * Math.ceil(speed), 0, maxScroll)
			if (container.scrollTop !== before) {
				updateDragFromPointer(mut.lastClientY)
			}
		}
		editor.timers.requestAnimationFrame(tickAutoScrollDuringDrag)
	}

	function ensureAutoScrollLoop() {
		if (mut.autoScrollScheduled) return
		mut.autoScrollScheduled = true
		editor.timers.requestAnimationFrame(tickAutoScrollDuringDrag)
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return

		const { clientY } = e
		const currentTarget = e.currentTarget as HTMLElement
		const { id, index } = currentTarget.dataset
		if (!id || index === undefined) return

		const startedOnDragHandle = currentTarget.dataset.dragHandle === 'true'
		if (startedOnDragHandle) {
			e.preventDefault()
			e.stopPropagation()
		}

		setPointerCapture(currentTarget, e)
		mut.justDragged = false
		mut.status = 'pointing'
		mut.id = id as TLPageId
		mut.startIndex = +index
		mut.dragIndex = +index
		mut.startY = clientY
		mut.lastClientY = clientY
		mut.startScrollTop = sortableContainer?.scrollTop ?? 0
		mut.startedOnDragHandle = startedOnDragHandle
	}

	function handlePointerMove(e: PointerEvent) {
		const { clientY } = e
		if (mut.status === 'pointing') {
			if (Math.abs(clientY - mut.startY) <= PAGE_MENU_DRAG_THRESHOLD) return
			mut.status = 'dragging'
			mut.lastClientY = clientY
			ensureAutoScrollLoop()
		}
		if (mut.status === 'dragging') {
			e.preventDefault()
			updateDragFromPointer(clientY)
		}
	}

	function resetDrag() {
		mut.status = 'idle'
		mut.id = null
		mut.startedOnDragHandle = false
		dragState = null
	}

	function handlePointerUp(e: PointerEvent) {
		if (mut.status === 'dragging' && mut.id) {
			onMovePage(editor, mut.id, mut.startIndex, mut.dragIndex, trackEvent)
			if (!mut.startedOnDragHandle) {
				mut.justDragged = true
			}
		}
		releasePointerCapture(e.currentTarget as HTMLElement, e)
		resetDrag()
	}

	function handleItemContextMenu(e: MouseEvent, index: number) {
		e.preventDefault()
		e.stopPropagation()

		closePageItemSubmenus(index)
		editor.menus.addOpenMenu(`page item submenu ${index}`)
	}

	function handlePointerCancel(e: PointerEvent) {
		releasePointerCapture(e.currentTarget as HTMLElement, e)
		resetDrag()
	}

	const isDragInProgress = $derived(dragState !== null)

	// Escape mid-drag cancels only the drag, so the popover's own Escape
	// dismissal is disabled while dragging. This listens on the document
	// because the dragged row doesn't always have focus, and stops the event
	// so other Escape handlers (like the one above that closes menus when
	// the body has focus) don't close the menu too.
	$effect(() => {
		if (!isDragInProgress) return
		const doc = editor.getContainerDocument()
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== 'Escape') return
			e.stopPropagation()
			// The row still holds pointer capture, so its release will click it.
			if (!mut.startedOnDragHandle) {
				mut.justDragged = true
			}
			resetDrag()
		}
		doc.addEventListener('keydown', handleKeyDown, true)
		return () => doc.removeEventListener('keydown', handleKeyDown, true)
	})

	// Closing the menu unmounts the rows while one may still hold pointer
	// capture, so their pointer up and cancel handlers never run (#11112).
	$effect(() => {
		if (!pageMenu.isOpen) resetDrag()
	})

	const shouldUseWindowPrompt = $derived(
		breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM && isCoarsePointer.current
	)
	const shouldUseDragHandle = $derived(!isReadonlyMode.current && isCoarsePointer.current)

	// Native listeners (not delegated `onpointer*` attributes): the drag handle stops propagation, and
	// the pointer handlers must run before the editor container's own listeners.
	const pointerDragEvents = nativeEvents<HTMLElement>({
		pointerdown: handlePointerDown,
		pointermove: handlePointerMove,
		pointerup: handlePointerUp,
		pointercancel: handlePointerCancel,
	})
	const rowDragAttachment = $derived(
		isReadonlyMode.current || isCoarsePointer.current ? undefined : pointerDragEvents
	)

	function startRenamingPage(id: TLPageId, currentName: string) {
		if (isReadonlyMode.current) return
		if (shouldUseWindowPrompt) {
			const name = window.prompt(msg(messages.actionRename), currentName)
			if (name && name !== currentName) {
				editor.renamePage(id, name)
				trackEvent('rename-page', { source: 'page-menu' })
			}
			return
		}
		editingPageId = id
	}

	function handleCreatePageClick() {
		if (isReadonlyMode.current) return

		const newPageId = PageRecordType.createId()
		const initialName = msg(messages.pageMenuNewPageInitialName)
		let name = initialName

		if (shouldUseWindowPrompt) {
			const result = window.prompt(msg(messages.pageMenuCreateNewPage), initialName)
			if (result === null) return
			name = result || initialName
		}

		editor.run(() => {
			editor.markHistoryStoppingPoint('creating page')
			editor.createPage({ name, id: newPageId })
			editor.setCurrentPage(newPageId)
		})

		if (!shouldUseWindowPrompt) {
			startRenamingPage(newPageId, initialName)
		}
		trackEvent('new-page', { source: 'page-menu' })
	}

	function changePage(id: TLPageId) {
		editor.markHistoryStoppingPoint('change-page')
		editor.setCurrentPage(id)
		trackEvent('change-page', { source: 'page-menu' })
	}

	function getRowY(index: number, isDragging: boolean): number {
		let y = index * PAGE_MENU_ITEM_HEIGHT
		if (dragState) {
			if (isDragging) {
				y = dragState.startIndex * PAGE_MENU_ITEM_HEIGHT + dragState.offsetY
			} else {
				const { startIndex, dragIndex } = dragState
				if (dragIndex < startIndex && index >= dragIndex && index < startIndex) {
					y = (index + 1) * PAGE_MENU_ITEM_HEIGHT
				} else if (dragIndex > startIndex && index > startIndex && index <= dragIndex) {
					y = (index - 1) * PAGE_MENU_ITEM_HEIGHT
				}
			}
		}
		return y
	}
</script>

<svelte:window onresize={updateAvailableHeight} />

<SvelteDrawUiPopover id="pages" onOpenChange={pageMenu.onOpenChange} open={pageMenu.isOpen}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<!-- The React trigger also passed data-testid="main.page-menu", which the button's own test id replaced. -->
			<SvelteDrawUiButton
				{...props}
				type="menu"
				tooltip={currentPage.current.name}
				title={currentPage.current.name}
				data-testid="page-menu.button"
				class="tlui-page-menu__trigger"
			>
				<SvelteDrawUiButtonLabel>{currentPage.current.name}</SvelteDrawUiButtonLabel>
				<SvelteDrawUiButtonIcon icon="chevron-down" small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent
		side="bottom"
		align="start"
		sideOffset={0}
		disableEscapeKeyDown={editingPageId !== null || isDragInProgress}
	>
		<div class="tlui-page-menu__wrapper">
			<div
				data-testid="page-menu.list"
				class="tlui-page-menu__list"
				bind:this={sortableContainer}
				{@attach blockWheelWhileDragging}
				style:height="{renderedListHeight}px"
			>
				<div
					class="tlui-page-menu__list__content"
					data-dragging={isDragInProgress}
					style:height="{autoFitListHeight}px"
				>
					{#each pages.current as page, index (page.id)}
						{@const isCurrentPage = page.id === currentPage.current.id}
						{@const isRenamingThisPage = editingPageId === page.id}
						{@const isDragging = dragState?.id === page.id}
						<!-- The row is a plain container; the context menu is a pointer shortcut to its submenu button. -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							data-pageid={page.id}
							data-testid="page-menu.item"
							data-iscurrent={isCurrentPage}
							data-dragging={isDragging}
							data-editing={isRenamingThisPage}
							class="tlui-page-menu__item"
							oncontextmenu={!isReadonlyMode.current && !isRenamingThisPage
								? (e) => handleItemContextMenu(e, index)
								: undefined}
							style:z-index={isDragging
								? pages.current.length + 2
								: isCurrentPage
									? pages.current.length + 1
									: index}
							style:transform="translateY({getRowY(index, isDragging)}px)"
						>
							{#if isRenamingThisPage}
								<div class="tlui-page-menu__item__title">
									<PageItemInput
										id={page.id}
										name={page.name}
										{isCurrentPage}
										onComplete={() => (editingPageId = null)}
										onCancel={() => (editingPageId = null)}
									/>
								</div>
							{:else}
								{#if shouldUseDragHandle}
									<SvelteDrawUiButton
										type="icon"
										class="tlui-page-menu__item__drag-handle"
										data-testid="page-menu.item-drag-handle"
										data-id={page.id}
										data-index={index}
										data-drag-handle="true"
										{@attach pointerDragEvents}
										tooltip={msg(messages.contextMenuReorder)}
										title={msg(messages.contextMenuReorder)}
									>
										<SvelteDrawUiButtonIcon icon="drag-handle-dots" small />
									</SvelteDrawUiButton>
								{/if}
								<SvelteDrawUiButton
									type="normal"
									class="tlui-page-menu__item__button"
									onclick={() => {
										if (mut.justDragged) {
											mut.justDragged = false
											return
										}
										changePage(page.id)
									}}
									ondblclick={() => startRenamingPage(page.id, page.name)}
									{@attach rowDragAttachment}
									{@attach nativeEvents<HTMLElement>({
										keydown(e) {
											if (e.key === 'Enter' && isCurrentPage) {
												startRenamingPage(page.id, page.name)
												editor.markEventAsHandled(e)
											}
										},
									})}
									tooltip={msg(messages.pageMenuGoToPage)}
									title={msg(messages.pageMenuGoToPage)}
									data-id={page.id}
									data-index={index}
								>
									<SvelteDrawUiButtonLabel>{page.name}</SvelteDrawUiButtonLabel>
								</SvelteDrawUiButton>
							{/if}
							{#if !isReadonlyMode.current && !isRenamingThisPage}
								<div class="tlui-page-menu__item__submenu">
									<PageItemSubmenu
										{index}
										item={page}
										listSize={pages.current.length}
										onRename={() => startRenamingPage(page.id, page.name)}
									/>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
			<div
				class="tlui-page-menu__resize-handle"
				data-resizing={isResizing}
				onpointerdown={handleResizePointerDown}
				ondblclick={handleResizeDoubleClick}
				role="separator"
				aria-orientation="horizontal"
				aria-label={msg(messages.pageMenuResize)}
			></div>
			<SvelteDrawUiButton
				type="menu"
				class="tlui-page-menu__create-button"
				data-testid="page-menu.create"
				tooltip={createPageButtonLabel}
				title={createPageButtonLabel}
				disabled={isReadonlyMode.current || hasReachedMaxPages}
				onclick={handleCreatePageClick}
			>
				<SvelteDrawUiButtonLabel>{createPageButtonLabel}</SvelteDrawUiButtonLabel>
				{#if !hasReachedMaxPages}<SvelteDrawUiButtonIcon icon="plus" small />{/if}
			</SvelteDrawUiButton>
		</div>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
