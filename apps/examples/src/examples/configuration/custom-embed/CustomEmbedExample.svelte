<script lang="ts">
	// There's a guide at the bottom of this file!
	import {
		DEFAULT_EMBED_DEFINITIONS,
		EmbedShapeUtil,
		SvelteDraw,
		type CustomEmbedDefinition,
		type DefaultEmbedDefinitionType,
		type TLComponents,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import InsertEmbedButton from './InsertEmbedButton.svelte'

	// [1]
	const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = ['svelte-draw', 'youtube']
	const defaultEmbedsToKeep = DEFAULT_EMBED_DEFINITIONS.filter((embed) =>
		defaultEmbedTypesToKeep.includes(embed.type)
	)

	// [2]
	const customEmbed: CustomEmbedDefinition = {
		type: 'jsfiddle',
		title: 'JSFiddle',
		hostnames: ['jsfiddle.net'],
		minWidth: 300,
		minHeight: 300,
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = new URL(url)
			const matches = urlObj.pathname.match(/\/([^/]+)\/([^/]+)\/(\d+)\/embedded/)
			if (matches) {
				return `https://jsfiddle.net/${matches[1]}/${matches[2]}/embedded/`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = new URL(url)
			const matches = urlObj.pathname.match(/\/([^/]+)\/([^/]+)\/(\d+)\/embedded/)
			if (matches) {
				return `https://jsfiddle.net/${matches[1]}/${matches[2]}/`
			}
			return
		},
		icon: 'https://jsfiddle.net/img/favicon.png',
	}

	// [3]
	const shapeUtils = [
		EmbedShapeUtil.configure({ embedDefinitions: [...defaultEmbedsToKeep, customEmbed] }),
	]

	// [4]
	const components: TLComponents = {
		TopPanel: InsertEmbedButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {components} />
</div>

<!--
[1]
svelte-draw ships embed definitions for several popular apps in `DEFAULT_EMBED_DEFINITIONS`. Here we
keep only the 'svelte-draw' and 'youtube' ones; the rest will no longer be offered in the embed dialog
or recognized when a URL is pasted.

[2]
A custom definition for JSFiddle. `hostnames` decides which pasted URLs this definition handles,
`toEmbedUrl` turns a page URL into the iframe URL (returning undefined rejects the URL), and
`fromEmbedUrl` maps back for copying the link out. Custom definitions must include an `icon`,
which the embed dialog shows next to the title.

[3]
`EmbedShapeUtil.configure({ embedDefinitions })` replaces the whole list, so include any
defaults you want to keep alongside the custom one.

[4]
An "Insert embed" button in the top panel (InsertEmbedButton.svelte), so the dialog is one click
away. It triggers the built-in `insert-embed` action via `getActions()`, the same one the main
menu uses.
-->
