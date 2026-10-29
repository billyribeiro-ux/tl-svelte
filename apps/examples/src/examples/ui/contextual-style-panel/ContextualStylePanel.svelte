<script lang="ts" module>
	import {
		defaultGeoTypeDefinitions,
		type Editor,
		type GeoShapeUtil,
		type StyleValuesForUi,
	} from 'svelte-draw'

	// There's a guide at the bottom of this file!

	// [1]
	const FILL_ITEMS = [
		{ value: 'none', icon: 'fill-none' },
		{ value: 'semi', icon: 'fill-semi' },
		{ value: 'solid', icon: 'fill-solid' },
		{ value: 'pattern', icon: 'fill-pattern' },
		{ value: 'lined-fill', icon: 'fill-lined-fill' },
		{ value: 'fill', icon: 'fill-fill' },
	] as const

	const DASH_ITEMS = [
		{ value: 'draw', icon: 'dash-draw' },
		{ value: 'dashed', icon: 'dash-dashed' },
		{ value: 'dotted', icon: 'dash-dotted' },
		{ value: 'solid', icon: 'dash-solid' },
	] as const

	const SIZE_ITEMS = [
		{ value: 's', icon: 'size-small' },
		{ value: 'm', icon: 'size-medium' },
		{ value: 'l', icon: 'size-large' },
		{ value: 'xl', icon: 'size-extra-large' },
	] as const

	const ARROW_KIND_ITEMS = [
		{ value: 'arc', icon: 'arrow-arc' },
		{ value: 'elbow', icon: 'arrow-elbow' },
	] as const

	const ARROWHEAD_ITEMS = [
		{ value: 'none', icon: 'arrowhead-none' },
		{ value: 'arrow', icon: 'arrowhead-arrow' },
		{ value: 'triangle', icon: 'arrowhead-triangle' },
		{ value: 'square', icon: 'arrowhead-square' },
		{ value: 'dot', icon: 'arrowhead-dot' },
		{ value: 'diamond', icon: 'arrowhead-diamond' },
		{ value: 'inverted', icon: 'arrowhead-triangle-inverted' },
		{ value: 'bar', icon: 'arrowhead-bar' },
	] as const

	const SPLINE_ITEMS = [
		{ value: 'line', icon: 'spline-line' },
		{ value: 'cubic', icon: 'spline-cubic' },
	] as const

	const TEXT_ALIGN_ITEMS = [
		{ value: 'start', icon: 'text-align-left' },
		{ value: 'middle', icon: 'text-align-center' },
		{ value: 'end', icon: 'text-align-right' },
	] as const

	const LABEL_ALIGN_ITEMS = [
		{ value: 'start', icon: 'horizontal-align-start' },
		{ value: 'middle', icon: 'horizontal-align-middle' },
		{ value: 'end', icon: 'horizontal-align-end' },
	] as const

	const VERTICAL_ALIGN_ITEMS = [
		{ value: 'start', icon: 'vertical-align-start' },
		{ value: 'middle', icon: 'vertical-align-middle' },
		{ value: 'end', icon: 'vertical-align-end' },
	] as const

	// [2]
	function getGeoStyleItems(editor: Editor): StyleValuesForUi<string> {
		const { customGeoTypes } = editor.getShapeUtil<GeoShapeUtil>('geo').options
		const merged = { ...defaultGeoTypeDefinitions, ...customGeoTypes }
		return Object.entries(merged).map(([value, definition]) => ({ value, icon: definition.icon }))
	}
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import {
		ArrowShapeArrowheadEndStyle,
		ArrowShapeArrowheadStartStyle,
		ArrowShapeKindStyle,
		Box,
		DefaultColorStyle,
		DefaultDashStyle,
		DefaultFillStyle,
		DefaultFontStyle,
		DefaultHorizontalAlignStyle,
		DefaultSizeStyle,
		DefaultTextAlignStyle,
		DefaultVerticalAlignStyle,
		GeoShapeGeoStyle,
		getColorStyleItems,
		getColorValue,
		getFontStyleItems,
		getTranslation,
		LineShapeSplineStyle,
		SvelteDrawUiContextualToolbar,
		type TLDefaultColorStyle,
	} from 'svelte-draw'
	import StylePicker from './StylePicker.svelte'

	// [7]
	const editor = getEditor()
	const msg = getTranslation()

	// [8]
	const visible = fromComputed(
		'contextualStylePanel.visible',
		() => editor.isIn('select.idle') && editor.getSelectedShapeIds().length > 0
	)
	const stylesValue = fromComputed('contextualStylePanel.styles', () => editor.getSharedStyles())
	const themeValue = fromComputed('contextualStylePanel.theme', () => editor.getCurrentTheme())
	const colorModeValue = fromComputed('contextualStylePanel.colorMode', () => editor.getColorMode())

	const styles = $derived(stylesValue.current)
	const theme = $derived(themeValue.current)
	const colors = $derived(theme.colors[colorModeValue.current])

	const color = $derived(styles.get(DefaultColorStyle))
	const fill = $derived(styles.get(DefaultFillStyle))
	const dash = $derived(styles.get(DefaultDashStyle))
	const size = $derived(styles.get(DefaultSizeStyle))
	const font = $derived(styles.get(DefaultFontStyle))
	const geo = $derived(styles.get(GeoShapeGeoStyle))
	const arrowKind = $derived(styles.get(ArrowShapeKindStyle))
	const arrowheadStart = $derived(styles.get(ArrowShapeArrowheadStartStyle))
	const arrowheadEnd = $derived(styles.get(ArrowShapeArrowheadEndStyle))
	const spline = $derived(styles.get(LineShapeSplineStyle))
	const textAlign = $derived(styles.get(DefaultTextAlignStyle))
	const labelAlign = $derived(styles.get(DefaultHorizontalAlignStyle))
	const verticalAlign = $derived(styles.get(DefaultVerticalAlignStyle))

	// [9]
	function getSelectionBounds() {
		const bounds = editor.getSelectionRotatedScreenBounds()
		if (!bounds) return undefined
		return new Box(bounds.x, bounds.y, bounds.width, 0)
	}
</script>

{#if visible.current}
	<SvelteDrawUiContextualToolbar {getSelectionBounds} label={msg('style-panel.title')}>
		{#if color}
			<StylePicker
				uiType="color"
				style={DefaultColorStyle}
				value={color}
				items={getColorStyleItems(colors)}
				getItemColor={(value) => getColorValue(colors, value as TLDefaultColorStyle, 'solid')}
			/>
		{/if}
		{#if fill}
			<StylePicker uiType="fill" style={DefaultFillStyle} value={fill} items={FILL_ITEMS} />
		{/if}
		{#if dash}
			<StylePicker uiType="dash" style={DefaultDashStyle} value={dash} items={DASH_ITEMS} />
		{/if}
		{#if size}
			<StylePicker uiType="size" style={DefaultSizeStyle} value={size} items={SIZE_ITEMS} />
		{/if}
		{#if font}
			<StylePicker
				uiType="font"
				style={DefaultFontStyle}
				value={font}
				items={getFontStyleItems(theme)}
			/>
		{/if}
		{#if geo}
			<StylePicker
				uiType="geo"
				style={GeoShapeGeoStyle}
				value={geo}
				items={getGeoStyleItems(editor)}
			/>
		{/if}
		{#if arrowKind}
			<StylePicker
				uiType="arrow-kind"
				style={ArrowShapeKindStyle}
				value={arrowKind}
				items={ARROW_KIND_ITEMS}
			/>
		{/if}
		{#if arrowheadStart}
			<StylePicker
				uiType="arrowheadStart"
				labelKey="style-panel.arrowhead-start"
				style={ArrowShapeArrowheadStartStyle}
				value={arrowheadStart}
				items={ARROWHEAD_ITEMS}
			/>
		{/if}
		{#if arrowheadEnd}
			<StylePicker
				uiType="arrowheadEnd"
				labelKey="style-panel.arrowhead-end"
				style={ArrowShapeArrowheadEndStyle}
				value={arrowheadEnd}
				items={ARROWHEAD_ITEMS}
			/>
		{/if}
		{#if spline}
			<StylePicker
				uiType="spline"
				style={LineShapeSplineStyle}
				value={spline}
				items={SPLINE_ITEMS}
			/>
		{/if}
		{#if textAlign}
			<StylePicker
				uiType="align"
				style={DefaultTextAlignStyle}
				value={textAlign}
				items={TEXT_ALIGN_ITEMS}
			/>
		{/if}
		{#if labelAlign}
			<StylePicker
				uiType="align"
				labelKey="style-panel.label-align"
				style={DefaultHorizontalAlignStyle}
				value={labelAlign}
				items={LABEL_ALIGN_ITEMS}
			/>
		{/if}
		{#if verticalAlign}
			<StylePicker
				uiType="verticalAlign"
				labelKey="style-panel.vertical-align"
				style={DefaultVerticalAlignStyle}
				value={verticalAlign}
				items={VERTICAL_ALIGN_ITEMS}
			/>
		{/if}
	</SvelteDrawUiContextualToolbar>
{/if}

<!--
The style panel is a component slot like any other. Switch off the built-in one and you can
build your own style controls and put them wherever your app needs them.

This example moves them onto the canvas, into a toolbar that floats above the selected shapes.
It shows only the styles that selection supports, so it's short for a highlighter and long for
an arrow.

[1]
Each picker needs a list of the style values it offers and an icon for each one. The SDK keeps
its own lists private, so we spell ours out here.

These match what the docked panel offers, which is narrower than what the schema allows. There's
no icon for the `pipe` arrowhead or for `dash: none`, and the `*-legacy` label alignments only
turn up in migrated documents, so none of them are worth a button. See [4] for what the trigger
shows when a shape holds one of these values anyway.

[2]
Three of the lists are built at render time instead. `getColorStyleItems` and `getFontStyleItems`
read the current theme, and `getGeoStyleItems` merges the built-in geo types with any registered
through `GeoShapeUtil.configure()`. Custom colors, fonts and geo types need no extra work here.

[3]
One component covers every style. The trigger shows the current value and opens a popover below
the toolbar, which keeps the rest of the controls visible while you pick.

`uiType` is the name the SDK uses for a style in its translation files, so it gives us the
button labels for free: "Color" and "Light blue" rather than `color` and `light-blue`. Four
styles name their panel section differently from their values, and `labelKey` covers those.

Only color passes `getItemColor`. Icons are drawn in `currentColor`, so setting `color` on a
button turns it into a swatch.

[4]
Two details on the trigger. The popover id comes from `style.id` rather than `uiType`, because
text align and label align share a `uiType` and would otherwise fight over one id. And when the
current value has no button of its own, we fall back to the first item's icon so the trigger
never renders blank. The docked panel's dropdowns do the same.

[5]
`setStyleForSelectedShapes` restyles the current selection and `setStyleForNextShapes` carries
the value to the next shape you draw. The docked panel sets both too. Marking a stopping point
first means one undo reverts the whole change.

[6]
A popover registers itself with the editor's menu system, and `MenuClickCapture` responds by
covering the canvas with a layer that swallows the next click. Our toolbar sits on the canvas,
underneath that layer, so it goes dead while a menu is open. Closing the popover as soon as a
value is picked keeps the toolbar clickable.

[7]
`fromComputed` bridges the reactive editor state it reads into Svelte, so this component updates when that state changes. That's
what makes the toolbar follow the selection.

[8]
A shape supports a style when its props schema declares it as a `StyleProp`, so the editor works
out which controls apply without us naming a single shape type. `editor.getSharedStyles()`
returns the styles that every selected shape supports, and we render a picker only when its
style is there.

Select a line and you get color, dash, size and spline. Select a text shape and you get color,
size, font and alignment. Select the two together and only color and size survive. Custom shapes
need no special handling: declare `color: DefaultColorStyle` in the props and the color picker
appears.

The reverse holds too. A frame declares `color` as a plain validator rather than a `StyleProp`,
which is how it stays out of the style panel, so selecting one here gives you no toolbar at all.

A style's value is `shared` when all the selected shapes agree on it and `mixed` when they
don't. The pickers use this to decide which item to highlight.

[9]
`getSelectionBounds` tells the toolbar where to position itself. We collapse the bounds to zero
height so the toolbar sits just above the top edge of the selection.

[10]
Setting `StylePanel` to null removes the docked panel on both desktop and mobile.
`InFrontOfTheCanvas` renders our toolbar on top of the shapes but behind the rest of the UI.
-->
