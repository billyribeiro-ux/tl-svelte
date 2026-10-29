<script lang="ts" module>
	import type { SharedStyle, StyleProp } from '@svelte-draw/editor'
	import type { StyleValuesForUi } from '../../../styles'

	/** @public */
	export interface StylePanelButtonPickerProps<T extends string> {
		title: string
		uiType: string
		style: StyleProp<T>
		value: SharedStyle<T>
		items: StyleValuesForUi<T>
		onValueChange?(style: StyleProp<T>, value: T): void
		onHistoryMark?(id: string): void
	}
</script>

<script lang="ts" generics="T extends string">
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import StylePanelButtonPickerInline from './StylePanelButtonPickerInline.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelSubheading from './StylePanelSubheading.svelte'

	let props: StylePanelButtonPickerProps<T> = $props()

	const ctx = getStylePanelContext()
</script>

{#if ctx.enhancedA11yMode}
	<StylePanelSubheading>{props.title}</StylePanelSubheading>
{/if}
<SvelteDrawUiToolbar label={props.title}>
	<StylePanelButtonPickerInline {...props} />
</SvelteDrawUiToolbar>
