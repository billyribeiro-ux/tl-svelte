<script lang="ts">
	// The singleton tooltip component that renders once, inside SvelteDrawUiTooltipProvider.
	import { getGlobalDocument } from '@svelte-draw/editor'
	import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'
	import { Tooltip } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'
	import { hideAllTooltips, tooltipManager } from './tooltipManager'

	const editor = tryGetEditor()
	const dir = getDirection()

	let isOpen = $state(false)
	let triggerElement = $state<HTMLElement | null>(null)
	let isFirstShow = true

	const currentTooltip = fromComputed('current tooltip', () => tooltipManager.getCurrentTooltipData())
	const cameraState = fromComputed('camera state', () => editor?.getCameraState())

	// Hide tooltip when camera is moving (panning/zooming)
	$effect(() => {
		const tooltip = currentTooltip.current
		if (cameraState.current === 'moving' && isOpen && tooltip) {
			tooltipManager.handleEvent({
				type: 'hide',
				tooltipId: tooltip.id,
				editor,
				instant: true,
			})
		}
	})

	$effect(() => {
		const doc = editor?.getContainerDocument() ?? getGlobalDocument()
		const tooltip = currentTooltip.current
		const open = isOpen
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && tooltip && open) {
				hideAllTooltips()
				event.stopPropagation()
			}
		}

		doc.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			doc.removeEventListener('keydown', handleKeyDown, { capture: true })
		}
	})

	// Hide tooltip and prevent new ones from opening while pointer is down
	$effect(() => {
		const doc = editor?.getContainerDocument() ?? getGlobalDocument()
		function handlePointerDown() {
			tooltipManager.handleEvent({ type: 'pointer_down' })
		}

		function handlePointerUp() {
			tooltipManager.handleEvent({ type: 'pointer_up' })
		}

		doc.addEventListener('pointerdown', handlePointerDown, { capture: true })
		doc.addEventListener('pointerup', handlePointerUp, { capture: true })
		doc.addEventListener('pointercancel', handlePointerUp, { capture: true })
		return () => {
			doc.removeEventListener('pointerdown', handlePointerDown, { capture: true })
			doc.removeEventListener('pointerup', handlePointerUp, { capture: true })
			doc.removeEventListener('pointercancel', handlePointerUp, { capture: true })
			// Reset pointer state on unmount to prevent stuck state
			tooltipManager.handleEvent({ type: 'pointer_up' })
		}
	})

	// Update open state and trigger position
	$effect(() => {
		const tooltip = currentTooltip.current
		let timer: ReturnType<typeof setTimeout> | null = null
		if (tooltip && triggerElement) {
			// Position the invisible trigger element over the active element
			const activeRect = tooltip.targetElement.getBoundingClientRect()
			const trigger = triggerElement

			trigger.style.position = 'fixed'
			trigger.style.left = '0px'
			trigger.style.top = '0px'
			const cbOffset = trigger.getBoundingClientRect()

			trigger.style.left = `${activeRect.left - cbOffset.left}px`
			trigger.style.top = `${activeRect.top - cbOffset.top}px`

			trigger.style.width = `${activeRect.width}px`
			trigger.style.height = `${activeRect.height}px`
			trigger.style.pointerEvents = 'none'
			trigger.style.zIndex = '9999'

			// Handle delay for first show
			if (isFirstShow) {
						timer = setTimeout(() => {
					isOpen = true
					isFirstShow = false
				}, tooltip.delayDuration)
			} else {
				// Subsequent tooltips show immediately
				isOpen = true
			}
		} else {
			// Hide tooltip immediately
			isOpen = false
			// Reset first show state after tooltip is hidden
			isFirstShow = true
		}

		return () => {
			if (timer !== null) {
				clearTimeout(timer)
			}
		}
	})
</script>

{#if currentTooltip.current}
	{@const tooltip = currentTooltip.current}
	<!-- Controlled: only our own state machine opens or closes the singleton. -->
	<Tooltip.Root bind:open={() => isOpen, () => {}} delayDuration={0}>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<div {...props} bind:this={triggerElement}></div>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			class="tlui-tooltip"
			side={tooltip.side}
			sideOffset={tooltip.sideOffset}
			avoidCollisions
			collisionPadding={8}
			dir={dir.current}
		>
			{#if typeof tooltip.content === 'string'}
				{tooltip.content}
			{:else}
				{@render tooltip.content()}
			{/if}
			<Tooltip.Arrow class="tlui-tooltip__arrow" />
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
