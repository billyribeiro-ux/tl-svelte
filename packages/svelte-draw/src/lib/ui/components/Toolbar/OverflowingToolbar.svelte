<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface OverflowingToolbarProps {
		children: Snippet
		orientation: 'horizontal' | 'vertical'
		sizingParentClassName: string
		minItems: number
		minSizePx: number
		maxItems: number
		maxSizePx: number
	}

	const NUMBERED_SHORTCUT_KEYS: Record<string, number> = {
		'1': 0,
		'2': 1,
		'3': 2,
		'4': 3,
		'5': 4,
		'6': 5,
		'7': 6,
		'8': 7,
		'9': 8,
		'0': 9,
	}

	function findParentWithClassName(startingElement: HTMLElement, className: string): HTMLElement {
		let element: HTMLElement | null = startingElement
		while (element) {
			if (element.classList.contains(className)) {
				return element
			}
			element = element.parentElement
		}
		throw new Error('Could not find parent with class name ' + className)
	}

	function setAttribute(element: HTMLElement, name: string, value: string) {
		if (element.getAttribute(name) === value) return
		element.setAttribute(name, value)
	}

	const messages = defineMessages({
		toolPanelMore: { id: 'tool-panel.more', defaultMessage: 'More' },
		toolPanelTitle: { id: 'tool-panel.title', defaultMessage: 'Tools' },
	})
</script>

<script lang="ts">
	import { activeElementShouldCaptureKeys, assert, modulate, preventDefault, tlmenus } from '@svelte-draw/editor'
	import { createUniqueSafeId, getEditor } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { untrack } from 'svelte'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { areShortcutsDisabled } from '../../hooks/useKeyboardShortcuts.svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiColumn from '../primitives/SvelteDrawUiColumn.svelte'
	import SvelteDrawUiRow from '../primitives/SvelteDrawUiRow.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiPopover from '../primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from '../primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from '../primitives/SvelteDrawUiPopoverTrigger.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import IsInOverflowProvider from './IsInOverflowProvider.svelte'

	let {
		children,
		orientation,
		sizingParentClassName,
		minItems,
		minSizePx,
		maxItems,
		maxSizePx,
	}: OverflowingToolbarProps = $props()

	const editor = getEditor()
	const id = createUniqueSafeId()
	const breakpoint = getBreakpoint()
	const msg = getTranslation()
	let buttons: HTMLElement[] = []
	let isOpen = $state(false)

	let mainToolsRef = $state<HTMLDivElement | null>(null)

	// we have to use state instead of a plain variable here so that we get
	// an update when the overflow popover mounts / unmounts
	let overflowTools = $state<HTMLElement | null>(null)
	let lastActiveOverflowItem = $state<string | null>(null)
	let shouldShowOverflow = $state(false)

	function onDomUpdate() {
		const mainTools = mainToolsRef
		if (!mainTools) return

		// whenever we get an update, we need to re-calculate the number of items to show and update
		// the component accordingly.
		const sizeProp = orientation === 'horizontal' ? 'offsetWidth' : 'offsetHeight'

		// toolbars can contain both single items and groups. we need to keep track of both.
		type Items = (
			| { type: 'item'; element: HTMLElement }
			| { type: 'group'; items: Items; element: HTMLElement }
		)[]

		// walk through the dom and collect items so we can calculate what to show/hide
		const mainItems = collectItems(mainTools.children)
		const overflowItems = overflowTools ? collectItems(overflowTools.children) : null
		function collectItems(collection: HTMLCollection) {
			const items: Items = []
			for (const child of collection) {
				if (child.classList.contains('tlui-main-toolbar__group')) {
					items.push({
						type: 'group',
						items: collectItems(child.children),
						element: child as HTMLElement,
					})
				} else if (
					!child.hasAttribute('data-radix-popper-content-wrapper') &&
					!child.hasAttribute('data-bits-floating-content-wrapper')
				) {
					items.push({ type: 'item', element: child as HTMLElement })
				}
			}

			return items
		}

		// the number of items to show is based on the space available to the toolbar.
		const sizingParent = findParentWithClassName(mainTools, sizingParentClassName)
		const size = sizingParent[sizeProp]
		const itemsToShow = Math.floor(
			modulate(size, [minSizePx, maxSizePx], [minItems, maxItems], true)
		)

		// now we know how many items to show, we need to walk through the items we found and show /
		// hide them accordingly. We need to keep track of:
		// the number of item's we've shown in the main content so far
		let mainItemCount = 0
		// the item that is currently active in the overflow content (if any)
		let newActiveOverflowItem: string | null = null
		// whether the last active overflow item is actually still in the overflow content
		let shouldInvalidateLastActiveOverflowItem = false
		// the buttons visible in the main content
		const numberedButtons: HTMLButtonElement[] = []
		function visitItems(
			mainItems: Items,
			overflowItems: Items | null
		): {
			// for each group of items we visit, we need to know whether we showed anything in
			// either section
			didShowAnyInMain: boolean
			didShowAnyInOverflow: boolean
		} {
			if (overflowItems) assert(mainItems.length === overflowItems.length)

			let didShowAnyInMain = false
			let didShowAnyInOverflow = false

			for (let i = 0; i < mainItems.length; i++) {
				const mainItem = mainItems[i]
				const overflowItem = overflowItems?.[i]

				if (mainItem.type === 'item') {
					const isLastActiveOverflowItem =
						mainItem.element.getAttribute('data-value') === lastActiveOverflowItem

					// for single items, we show them in main if we have space, or if they're the
					// last-used item from the overflow.
					let shouldShowInMain
					if (lastActiveOverflowItem) {
						shouldShowInMain = mainItemCount < itemsToShow || isLastActiveOverflowItem
					} else {
						// we use <= here because if there is no last active overflow item, we want
						// to show at least one item in the main toolbar.
						shouldShowInMain = mainItemCount <= itemsToShow
					}
					const shouldShowInOverflow = mainItemCount >= itemsToShow

					didShowAnyInMain ||= shouldShowInMain
					didShowAnyInOverflow ||= shouldShowInOverflow

					setAttribute(
						mainItem.element,
						'data-toolbar-visible',
						shouldShowInMain ? 'true' : 'false'
					)
					if (overflowItem) {
						assert(overflowItem.type === 'item')
						setAttribute(
							overflowItem.element,
							'data-toolbar-visible',
							shouldShowInOverflow ? 'true' : 'false'
						)
					}
					if (shouldShowInOverflow && mainItem.element.getAttribute('aria-pressed') === 'true') {
						newActiveOverflowItem = mainItem.element.getAttribute('data-value')
					}
					if (shouldShowInMain && mainItem.element.tagName === 'BUTTON') {
						numberedButtons.push(mainItem.element as HTMLButtonElement)
					}
					if (!shouldShowInOverflow && isLastActiveOverflowItem) {
						shouldInvalidateLastActiveOverflowItem = true
					}
					mainItemCount++
				} else {
					// for groups, we show them in main if we have space, or if they're the
					// last-used item from the overflow.
					let result, overflowGroup
					if (overflowItem) {
						assert(overflowItem.type === 'group')
						overflowGroup = overflowItem
						result = visitItems(mainItem.items, overflowGroup.items)
					} else {
						result = visitItems(mainItem.items, null)
					}

					didShowAnyInMain ||= result.didShowAnyInMain
					didShowAnyInOverflow ||= result.didShowAnyInOverflow

					setAttribute(
						mainItem.element,
						'data-toolbar-visible',
						result.didShowAnyInMain ? 'true' : 'false'
					)
					if (overflowGroup) {
						setAttribute(
							overflowGroup.element,
							'data-toolbar-visible',
							result.didShowAnyInOverflow ? 'true' : 'false'
						)
					}
				}
			}
			return { didShowAnyInMain, didShowAnyInOverflow }
		}

		const { didShowAnyInOverflow } = visitItems(mainItems, overflowItems)
		shouldShowOverflow = didShowAnyInOverflow
		if (newActiveOverflowItem) {
			lastActiveOverflowItem = newActiveOverflowItem
		} else if (shouldInvalidateLastActiveOverflowItem) {
			lastActiveOverflowItem = null
		}

		buttons = numberedButtons
	}

	// React ran this after every render. The things that used to trigger a render and that the
	// observers below can't see are listed here: the overflow popover mounting, the last active
	// overflow item, and the props that feed the calculation.
	$effect(() => {
		void [
			overflowTools,
			lastActiveOverflowItem,
			mainToolsRef,
			orientation,
			sizingParentClassName,
			minItems,
			minSizePx,
			maxItems,
			maxSizePx,
		]
		untrack(onDomUpdate)
	})

	$effect(() => {
		const mainTools = mainToolsRef
		if (!mainTools) return

		const update = () => untrack(onDomUpdate)
		const mutationObserver = new MutationObserver(update)
		// Watch for structure changes plus only the attributes onDomUpdate actually reads.
		// `aria-pressed` flips when the active tool/geo variant changes — important for cases where
		// only individual ToolbarItem children re-render and OverflowingToolbar itself does not (see
		// #8689). `data-value` identifies the tool slot. We deliberately exclude all other
		// attributes (notably `data-state`, `aria-describedby`, `aria-expanded` from tooltip /
		// popover wrappers, and our own `data-toolbar-visible` writes) to avoid hover- and
		// self-triggered recomputes that caused ResizeObserver loop warnings (see #8528).
		mutationObserver.observe(mainTools, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-pressed', 'data-value'],
		})

		const sizingParent = findParentWithClassName(mainTools, sizingParentClassName)
		const resizeObserver = new ResizeObserver(update)
		resizeObserver.observe(sizingParent)

		return () => {
			mutationObserver.disconnect()
			resizeObserver.disconnect()
		}
	})

	$effect(() => {
		if (!editor.options.enableToolbarKeyboardShortcuts) return

		function handleKeyDown(event: KeyboardEvent) {
			if (
				areShortcutsDisabled(editor) ||
				activeElementShouldCaptureKeys(false /* includeButton */, editor.getContainerDocument())
			) {
				return
			}

			// no accelerator keys
			if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
			const index = NUMBERED_SHORTCUT_KEYS[event.key]
			if (typeof index === 'number') {
				preventDefault(event)
				buttons[index]?.click()
			}
		}

		const doc = editor.getContainerDocument()
		doc.addEventListener('keydown', handleKeyDown)
		return () => {
			doc.removeEventListener('keydown', handleKeyDown)
		}
	})

	const popoverId = 'toolbar overflow'
</script>

{#snippet mainContent()}
	<SvelteDrawUiMenuContextProvider type="toolbar" sourceId="toolbar">
		{@render children()}
	</SvelteDrawUiMenuContextProvider>
{/snippet}

<SvelteDrawUiToolbar
	{orientation}
	class={classNames('tlui-main-toolbar__tools', {
		'tlui-main-toolbar__tools__mobile': breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM,
	})}
	label={msg(messages.toolPanelTitle)}
>
	{#if orientation === 'horizontal'}
		<SvelteDrawUiRow id={`${id}_main`} bind:ref={mainToolsRef}>
			{@render mainContent()}
		</SvelteDrawUiRow>
	{:else}
		<SvelteDrawUiColumn id={`${id}_main`} bind:ref={mainToolsRef}>
			{@render mainContent()}
		</SvelteDrawUiColumn>
	{/if}
	{#if shouldShowOverflow}
		<IsInOverflowProvider>
			<SvelteDrawUiPopover
				id={popoverId}
				open={isOpen}
				onOpenChange={(open) => {
					isOpen = open
				}}
			>
				<SvelteDrawUiPopoverTrigger>
					{#snippet child({ props })}
						<SvelteDrawUiToolbarButton
							{...props}
							title={msg(messages.toolPanelMore)}
							type="tool"
							class="tlui-main-toolbar__overflow"
							data-testid="tools.more-button"
						>
							<SvelteDrawUiButtonIcon
								icon={orientation === 'horizontal' ? 'chevron-up' : 'chevron-right'}
							/>
						</SvelteDrawUiToolbarButton>
					{/snippet}
				</SvelteDrawUiPopoverTrigger>
				<SvelteDrawUiPopoverContent
					side={orientation === 'horizontal' ? 'top' : 'right'}
					align={orientation === 'horizontal' ? 'center' : 'end'}
				>
					<SvelteDrawUiToolbar
						orientation="grid"
						class="tlui-main-toolbar__overflow-content"
						bind:ref={overflowTools}
						data-testid="tools.more-content"
						label={msg(messages.toolPanelMore)}
						id={`${id}_more`}
						onclick={() => {
							tlmenus.deleteOpenMenu(popoverId, editor.contextId)
							isOpen = false
						}}
					>
						<SvelteDrawUiMenuContextProvider type="toolbar-overflow" sourceId="toolbar">
							{@render children()}
						</SvelteDrawUiMenuContextProvider>
					</SvelteDrawUiToolbar>
				</SvelteDrawUiPopoverContent>
			</SvelteDrawUiPopover>
		</IsInOverflowProvider>
	{/if}
</SvelteDrawUiToolbar>
