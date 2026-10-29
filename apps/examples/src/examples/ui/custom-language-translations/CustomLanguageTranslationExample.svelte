<script lang="ts">
	import { SvelteDraw, type TLComponents, type TLUiOverrides } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './custom-language-translations.css'
	import CustomToolbar from './CustomToolbar.svelte'

	// There's a guide at the bottom of this file!

	// [4]
	const overrides: TLUiOverrides = {
		translations: {
			en: {
				'action.duplicate': 'Make a copy',
				'action.delete': 'Remove',
				'example.selected':
					'{count, plural, =0 {Nothing selected} one {# shape selected} other {# shapes selected}}',
			},
			es: {
				'action.duplicate': 'Hacer una copia',
				'action.delete': 'Eliminar',
				'example.selected':
					'{count, plural, =0 {Nada seleccionado} one {# forma seleccionada} other {# formas seleccionadas}}',
			},
		},
	}

	// [5]
	const components: TLComponents = {
		TopPanel: CustomToolbar,
	}
</script>

<div class="svelte-draw__editor">
	<!-- [6] -->
	<SvelteDraw {overrides} {components} />
</div>

<!--
This example shows how to customize svelte-draw's translation strings and use them in your own
components. This is useful when you need to match your app's brand voice or terminology.

[1]
`getTranslation()` returns a function (conventionally named `msg`) that looks up a
translated string by key in the user's current language (CustomToolbar.svelte).

[2]
Messages are ICU MessageFormat, so one string covers every count. Pass the values it needs as a
second argument. The plural categories are the locale's own, which is why this can't be done by
picking between two strings in code: Arabic has six categories, Polish four, Russian three.

[3]
`action.duplicate` and `action.delete` are keys svelte-draw already uses in its own menus. Because we
override them below, both our toolbar and svelte-draw's built-in menus show the custom text.

[4]
The `translations` override maps a language code (like `en` or `es`) to an object of translation
keys and strings. You can override existing keys or add new ones for your own UI, like
`example.selected` here. Languages you don't override fall back to svelte-draw's defaults.

[5]
Define the components object outside of any reactive code so it's a stable reference. The custom
toolbar is placed in the `TopPanel` slot.

[6]
Pass both the overrides and the components to the `SvelteDraw` component.

The custom translations also show up in svelte-draw's own menus. Try creating a shape and right
clicking it to see "Make a copy" and "Remove" in the context menu, or switch the language to
Spanish from the main menu's language submenu to see the `es` overrides, including the count,
which agrees with itself in both languages.
-->
