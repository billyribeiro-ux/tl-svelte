<script lang="ts">
	import { GeoShapeGeoStyle } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import type { GeoShapeUtil } from '../../../shapes/geo/GeoShapeUtil'
	import { defaultGeoTypeDefinitions, type GeoTypeDefinition } from '../../../shapes/geo/getGeoShapePath'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDropdownPicker from './StylePanelDropdownPicker.svelte'

	const editor = getEditor()
	const ctx = getStylePanelContext()
	const geo = $derived(ctx.styles.get(GeoShapeGeoStyle))

	const items = $derived.by(() => {
		const customGeoTypes = editor.getShapeUtil<GeoShapeUtil>('geo').options.customGeoTypes
		const merged: Record<string, GeoTypeDefinition> = {
			...defaultGeoTypeDefinitions,
			...customGeoTypes,
		}
		return Object.entries(merged).map(([value, def]) => ({ value, icon: def.icon }))
	})
</script>

{#if geo !== undefined}
	<StylePanelDropdownPicker
		label="style-panel.geo"
		type="menu"
		id="geo"
		uiType="geo"
		stylePanelType="geo"
		style={GeoShapeGeoStyle}
		{items}
		value={geo}
	/>
{/if}
