<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { TLUiTooltipContent } from './tooltipManager'

	/** @public */
	export interface SvelteDrawUiTooltipProps {
		/**
		 * Replaces React's single `children` element (which was cloned to attach handlers). Render
		 * the element that should trigger the tooltip and spread `props` onto it. Use `mergeProps`
		 * from `bits-ui` if the element has its own event handlers.
		 *
		 * @example
		 * ```svelte
		 * <SvelteDrawUiTooltip content="Hello">
		 *   {#snippet child({ props })}<button {...props}>Hover me</button>{/snippet}
		 * </SvelteDrawUiTooltip>
		 * ```
		 */
		child: Snippet<[{ props: Record<string, unknown> }]>
		content?: TLUiTooltipContent
		side?: 'top' | 'right' | 'bottom' | 'left'
		sideOffset?: number
		disabled?: boolean
		showOnMobile?: boolean
		delayDuration?: number
	}
</script>

<script lang="ts">
	import { uniqueId } from '@svelte-draw/editor'
	import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'
	import { Tooltip } from 'bits-ui'
	import { createAttachmentKey } from 'svelte/attachments'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'
	import { getSvelteDrawUiOrientation } from './layout.svelte'
	import { getHasTooltipProvider } from './tooltipContext'
	import { tooltipManager } from './tooltipManager'

	const DEFAULT_TOOLTIP_DELAY_MS = 700

	let {
		child: childSnippet,
		content,
		side,
		sideOffset = 5,
		disabled = false,
		showOnMobile = false,
		delayDuration,
	}: SvelteDrawUiTooltipProps = $props()

	const editor = tryGetEditor()
	const dir = getDirection()
	const tooltipId = uniqueId()
	const hasProvider = getHasTooltipProvider()
	const enhancedA11yMode = fromComputed('enhancedA11yMode', () =>
		editor?.user.getEnhancedA11yMode()
	)

	const orientationCtx = getSvelteDrawUiOrientation()
	const sideToUse = $derived(side ?? orientationCtx.tooltipSide)

	$effect(() => {
		return () => {
			if (hasProvider) {
				tooltipManager.handleEvent({
					type: 'hide',
					tooltipId,
					editor,
					instant: true,
				})
			}
		}
	})

	const delayDurationToUse = $derived(
		enhancedA11yMode.current
			? 0
			: (delayDuration ?? (editor?.options.tooltipDelayMs || DEFAULT_TOOLTIP_DELAY_MS))
	)

	function show(targetElement: HTMLElement) {
		if (!content) return
		tooltipManager.handleEvent({
			type: 'show',
			tooltip: {
				id: tooltipId,
				content,
				targetElement,
				side: sideToUse,
				sideOffset,
				showOnMobile,
				delayDuration: delayDurationToUse,
			},
		})
	}

	function hide() {
		tooltipManager.handleEvent({
			type: 'hide',
			tooltipId,
			editor,
			instant: false,
		})
	}

	// Attached to the child element in provider mode. React's onFocus / onBlur bubble, so the
	// focusin / focusout events are the equivalent here (e.g. a slider thumb inside the target).
	const singletonProps = {
		[createAttachmentKey()]: (element: HTMLElement) => {
			const onEnter = () => show(element)
			const onFocusIn = () => show(element)
			element.addEventListener('mouseenter', onEnter)
			element.addEventListener('mouseleave', hide)
			element.addEventListener('focusin', onFocusIn)
			element.addEventListener('focusout', hide)
			return () => {
				element.removeEventListener('mouseenter', onEnter)
				element.removeEventListener('mouseleave', hide)
				element.removeEventListener('focusin', onFocusIn)
				element.removeEventListener('focusout', hide)
			}
		},
	}
</script>

<!-- Don't show tooltip if disabled or there is no content -->
{#if disabled || !content}
	{@render childSnippet({ props: {} })}
{:else if !hasProvider || enhancedA11yMode.current}
	<!-- Fallback to old behavior if no provider -->
	<Tooltip.Root
		delayDuration={delayDurationToUse}
		disableHoverableContent={!enhancedA11yMode.current}
	>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render childSnippet({ props })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			class="tlui-tooltip"
			side={sideToUse}
			{sideOffset}
			avoidCollisions
			collisionPadding={8}
			dir={dir.current}
		>
			{#if typeof content === 'string'}
				{content}
			{:else}
				{@render content()}
			{/if}
			<Tooltip.Arrow class="tlui-tooltip__arrow" />
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	{@render childSnippet({ props: singletonProps })}
{/if}
