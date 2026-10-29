<script lang="ts" module>
	import type { SharedStyle, StyleProp } from '@svelte-draw/editor'
	import type { StyleValuesForUi } from '../../../styles'
	import type { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'

	/** @public */
	export interface StylePanelDropdownPickerProps<T extends string> {
		id: string
		label?: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		uiType: string
		stylePanelType: string
		style: StyleProp<T>
		value: SharedStyle<T>
		items: StyleValuesForUi<T>
		type: 'icon' | 'tool' | 'menu'
		onValueChange?(style: StyleProp<T>, value: T): void
		/** Override the test ID prefix. Defaults to uiType. */
		testIdType?: string
		/**
		 * Distance to push the popover left of the trigger so it lands flush with the style panel.
		 * Defaults to the standard popover gap so standalone dropdowns don't sit flush against the panel.
		 */
		sideOffset?: number
		/** Is the dropdown an overflow of a different radio group? If so, show active when the group's active item is inside of the dropdown.*/
		isOverflow?: boolean
	}
</script>

<script lang="ts" generics="T extends string">
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessageId } from '../../styleMessages'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import StylePanelDropdownPickerInline from './StylePanelDropdownPickerInline.svelte'

	let props: StylePanelDropdownPickerProps<T> = $props()

	const msg = getTranslation()
	const toolbarLabel = $derived(
		props.label ? msg(props.label) : msg(stylePanelMessageId(props.stylePanelType))
	)
</script>

<SvelteDrawUiToolbar label={toolbarLabel}>
	<StylePanelDropdownPickerInline {...props} />
</SvelteDrawUiToolbar>
