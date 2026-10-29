<script lang="ts" module>
	/** @public */
	export interface TLUiSliderProps {
		min?: number
		steps: number
		value: number | null
		label: string
		title: string
		onValueChange(value: number): void
		onHistoryMark?(id: string): void
		'data-testid'?: string
		ariaValueModifier?: number
		/** The slider thumb element (React forwarded its ref to the thumb). */
		ref?: HTMLElement | null
	}

	const SLIDER_VALUE_KEYS = new Set([
		'ArrowUp',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'PageUp',
		'PageDown',
		'Home',
		'End',
	])

	const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
</script>

<script lang="ts">
	import { tltime } from '@svelte-draw/editor'
	import { mergeProps, Slider } from 'bits-ui'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import type { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
	import SvelteDrawUiTooltip from './SvelteDrawUiTooltip.svelte'
	import { hideAllTooltips } from './tooltipManager'

	let {
		onHistoryMark,
		title,
		min,
		steps,
		value,
		label,
		onValueChange,
		'data-testid': testId,
		ariaValueModifier = 1,
		ref = $bindable(null),
	}: TLUiSliderProps = $props()

	const msg = getTranslation()
	const dir = getDirection()
	let titleAndLabel = $state('')

	// XXX: bits-ui (like Radix) starts out our slider thumb with a tabIndex of 0
	// This causes some tab focusing issues, most prevelant in MobileStylePanel,
	// where it grabs the focus. This works around it.
	let tabIndex = $state(-1)
	$effect(() => {
		tabIndex = 0
	})

	function handlePointerDown() {
		hideAllTooltips()
		onHistoryMark?.('click slider')
	}

	// N.B. This is a bit silly. The slider auto-focuses which
	// triggers SvelteDrawUiTooltip handleFocus when we dbl-click to edit an image,
	// which in turn makes the tooltip display prematurely.
	// This makes it wait until we've focused to show the tooltip.
	$effect(() => {
		const nextTitleAndLabel = title + ' — ' + msg(label as TLUiTranslationKey)
		const timeout = tltime.setTimeout(
			'set title and label',
			() => {
				titleAndLabel = nextTitleAndLabel
			},
			0
		)
		return () => clearTimeout(timeout)
	})

	// N.B. Annoying. For a11y purposes, we need Tab to work.
	// For some reason, the slider primitive has custom behavior here
	// that interferes with tabbing past the slider and then
	// you get stuck in the slider.
	function handleKeyEvent(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.stopPropagation()
		}
	}

	// Capture phase so the mark lands before the thumb's own keydown handler changes the value;
	// otherwise keyboard changes squash into the preceding history entry and undo skips past them.
	// Repeats from a held key are skipped so the run is one undo step, like a pointer drag.
	function handleKeyDown(event: KeyboardEvent) {
		handleKeyEvent(event)
		if (SLIDER_VALUE_KEYS.has(event.key) && !event.repeat) {
			onHistoryMark?.('keyboard slider')
		}

		// Radix moves ten steps for PageUp / PageDown / Shift+Arrow; bits-ui's thumb does not handle
		// PageUp / PageDown at all and moves a single step for Shift+Arrow, so those keys are handled here.
		const isPageKey = event.key === 'PageUp' || event.key === 'PageDown'
		const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.has(event.key))
		if (isSkipKey && value !== null) {
			event.preventDefault()
			event.stopPropagation()
			const isRtl = dir.current === 'rtl'
			const isDecrease =
				event.key === 'PageDown' ||
				event.key === 'ArrowDown' ||
				(event.key === 'ArrowLeft' && !isRtl) ||
				(event.key === 'ArrowRight' && isRtl)
			const next = Math.min(
				steps,
				Math.max(min ?? 0, value + (isDecrease ? -10 : 10))
			)
			if (next !== value) onValueChange(next)
		}
	}

	function setValue(next: number) {
		onValueChange(next)
	}
</script>

<div class="tlui-slider__container">
	<SvelteDrawUiTooltip content={titleAndLabel}>
		{#snippet child({ props: tooltipProps })}
			<Slider.Root
				type="single"
				data-testid={testId}
				dir={dir.current}
				min={min ?? 0}
				max={steps}
				step={1}
				bind:value={() => value ?? (min ?? 0), setValue}
			>
				{#snippet child({ props: rootProps })}
					<span
						{...mergeProps(rootProps, tooltipProps, {
							class: 'tlui-slider',
							onpointerdown: handlePointerDown,
							onkeydowncapture: handleKeyDown,
							onkeyupcapture: handleKeyEvent,
						})}
					>
						<div class="tlui-slider__track" dir={dir.current}>
							{#if value !== null}
								<Slider.Range class="tlui-slider__range" />
							{/if}
						</div>
						{#if value !== null}
							<Slider.Thumb index={0}>
								{#snippet child({ props: thumbProps })}
									<span
										{...thumbProps}
										role="slider"
										bind:this={ref}
										aria-valuemin={(min ?? 0) * ariaValueModifier}
										aria-valuenow={value * ariaValueModifier}
										aria-valuemax={steps * ariaValueModifier}
										aria-label={titleAndLabel}
										class="tlui-slider__thumb"
										tabindex={tabIndex}
									></span>
								{/snippet}
							</Slider.Thumb>
						{/if}
					</span>
				{/snippet}
			</Slider.Root>
		{/snippet}
	</SvelteDrawUiTooltip>
</div>
