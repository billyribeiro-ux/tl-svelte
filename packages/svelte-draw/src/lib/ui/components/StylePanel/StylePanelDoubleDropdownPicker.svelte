<script lang="ts" module>
	import type { SharedStyle, StyleProp } from '@svelte-draw/editor'
	import type { StyleValuesForUi } from '../../../styles'
	import type { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'

	/** @public */
	export interface StylePanelDoubleDropdownPickerProps<T extends string> {
		uiTypeA: string
		uiTypeB: string
		label: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		labelA: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		labelB: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		itemsA: StyleValuesForUi<T>
		itemsB: StyleValuesForUi<T>
		styleA: StyleProp<T>
		styleB: StyleProp<T>
		valueA: SharedStyle<T>
		valueB: SharedStyle<T>
		onValueChange?(style: StyleProp<T>, value: T): void
	}
</script>

<script lang="ts" generics="T extends string">
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import StylePanelDoubleDropdownPickerInline from './StylePanelDoubleDropdownPickerInline.svelte'

	let props: StylePanelDoubleDropdownPickerProps<T> = $props()

	const msg = getTranslation()
</script>

<div class="tlui-style-panel__double-select-picker">
	<div title={msg(props.label)} class="tlui-style-panel__double-select-picker-label">
		{msg(props.label)}
	</div>
	<SvelteDrawUiToolbar orientation="horizontal" label={msg(props.label)}>
		<StylePanelDoubleDropdownPickerInline {...props} />
	</SvelteDrawUiToolbar>
</div>
