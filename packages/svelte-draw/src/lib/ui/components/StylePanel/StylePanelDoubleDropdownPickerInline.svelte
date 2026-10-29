<script lang="ts" generics="T extends string">
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDoubleDropdownHalf from './StylePanelDoubleDropdownHalf.svelte'
	import type { StylePanelDoubleDropdownPickerProps } from './StylePanelDoubleDropdownPicker.svelte'

	let props: StylePanelDoubleDropdownPickerProps<T> = $props()

	const ctx = getStylePanelContext()

	const onValueChange = $derived(props.onValueChange ?? ctx.onValueChange)
</script>

{#if !(props.valueA === undefined && props.valueB === undefined)}
	<StylePanelDoubleDropdownHalf
		id={`style panel ${props.uiTypeA} A`}
		uiType={props.uiTypeA}
		label={props.labelA}
		items={props.itemsA}
		style={props.styleA}
		value={props.valueA}
		{onValueChange}
		sideOffset={80}
		invertIcon
	/>
	<StylePanelDoubleDropdownHalf
		id={`style panel ${props.uiTypeB} B`}
		uiType={props.uiTypeB}
		label={props.labelB}
		items={props.itemsB}
		style={props.styleB}
		value={props.valueB}
		{onValueChange}
		sideOffset={116}
	/>
{/if}
