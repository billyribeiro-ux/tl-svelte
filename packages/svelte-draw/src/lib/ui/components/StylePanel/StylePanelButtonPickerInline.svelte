<script lang="ts" generics="T extends string">
	import {
		DefaultColorStyle,
		elementShouldCaptureKeys,
		getColorValue,
		type StyleProp,
		type TLDefaultColorStyle,
	} from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { styleMessageId, stylePanelMessages } from '../../styleMessages'
	import StylePanelIcon from './StylePanelIcon.svelte'
	import SvelteDrawUiToolbarToggleGroup from '../primitives/SvelteDrawUiToolbarToggleGroup.svelte'
	import SvelteDrawUiToolbarToggleItem from '../primitives/SvelteDrawUiToolbarToggleItem.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import type { StylePanelButtonPickerProps } from './StylePanelButtonPicker.svelte'

	let props: StylePanelButtonPickerProps<T> = $props()

	const ctx = getStylePanelContext()
	const editor = getEditor()
	const colors = fromComputed(
		'style panel button picker colors',
		() => editor.getCurrentTheme().colors[editor.getColorMode()]
	)
	const msg = getTranslation()
	const breakpoint = getBreakpoint()

	// Read through `props` (not destructured) so a changing prop is followed. The handlers below
	// run from DOM events, so they see the current values.
	const onValueChange = (style: StyleProp<T>, value: T) =>
		(props.onValueChange ?? ctx.onValueChange)(style, value)
	const onHistoryMark = (id: string) => (props.onHistoryMark ?? ctx.onHistoryMark)(id)

	let isPointing = false
	let pointingOriginalActiveElement: HTMLElement | null = null

	function handlePointerUp() {
		isPointing = false
		editor.getContainerWindow().removeEventListener('pointerup', handlePointerUp)

		// This is fun little micro-optimization to make sure that the focus
		// is retained on a text label. That way, you can continue typing
		// after selecting a style.
		const origActiveEl = pointingOriginalActiveElement
		if (origActiveEl && elementShouldCaptureKeys(origActiveEl, false)) {
			origActiveEl.focus()
		} else if (breakpoint.current >= PORTRAIT_BREAKPOINT.TABLET_SM) {
			editor.getContainer().focus()
		}
		pointingOriginalActiveElement = null
	}

	function handleButtonClick(e: MouseEvent & { currentTarget: HTMLElement }) {
		const { id } = e.currentTarget.dataset
		if (props.value.type === 'shared' && props.value.value === id) return

		onHistoryMark('point picker item')
		onValueChange(props.style, id as T)
	}

	function handleButtonPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
		const { id } = e.currentTarget.dataset

		onHistoryMark('point picker item')
		onValueChange(props.style, id as T)

		isPointing = true
		pointingOriginalActiveElement = editor.getContainerDocument().activeElement as HTMLElement
		editor.getContainerWindow().addEventListener('pointerup', handlePointerUp) // see TLD-658
	}

	function handleButtonPointerEnter(e: PointerEvent & { currentTarget: HTMLElement }) {
		if (!isPointing) return

		const { id } = e.currentTarget.dataset
		onValueChange(props.style, id as T)
	}

	function handleButtonPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
		// Only apply on release if the scrub started in this picker. Otherwise
		// releasing over a different style section selects that section's
		// option, even though scrubbing can't cross sections. See #9223.
		if (!isPointing) return

		const { id } = e.currentTarget.dataset
		if (props.value.type === 'shared' && props.value.value === id) return

		onValueChange(props.style, id as T)
	}

	// `asChild` + Layout in React: the toggle group element itself carries the layout class.
	const layoutClass = $derived(props.items.length > 4 ? 'tlui-grid' : 'tlui-row')
</script>

<!-- The Layout wrapper of the React version (Grid for more than 4 items, else Row) is applied as a class on the toggle group element. -->
<SvelteDrawUiToolbarToggleGroup
	data-testid={`style.${props.uiType}`}
	type="single"
	class={layoutClass}
	value={props.value.type === 'shared' ? props.value.value : null}
>
	{#each props.items as item (item.value)}
		{@const isActive = props.value.type === 'shared' && props.value.value === item.value}
		{@const label = props.title + ' — ' + msg(styleMessageId(props.uiType, item.value))}
		{#snippet tooltip()}
			<div>{label}</div>
			{#if isActive}<div>({msg(stylePanelMessages.selected)})</div>{/if}
		{/snippet}
		<SvelteDrawUiToolbarToggleItem
			type="icon"
			data-id={item.value}
			data-testid={`style.${props.uiType}.${item.value}`}
			aria-label={label + (isActive ? ` (${msg(stylePanelMessages.selected)})` : '')}
			{tooltip}
			value={item.value}
			data-state={isActive ? 'on' : 'off'}
			data-isactive={isActive}
			title={label}
			style={props.style === (DefaultColorStyle as StyleProp<unknown>)
				? `color: ${getColorValue(colors.current, item.value as TLDefaultColorStyle, 'solid')}`
				: undefined}
			onpointerenter={handleButtonPointerEnter}
			onpointerdown={handleButtonPointerDown}
			onpointerup={handleButtonPointerUp}
			onclick={handleButtonClick}
		>
			<StylePanelIcon icon={item.icon} />
		</SvelteDrawUiToolbarToggleItem>
	{/each}
</SvelteDrawUiToolbarToggleGroup>
