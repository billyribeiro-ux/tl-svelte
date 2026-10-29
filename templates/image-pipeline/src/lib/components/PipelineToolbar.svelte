<script lang="ts">
	import {
		AssetToolbarItem,
		DefaultActionsMenu,
		DefaultQuickActions,
		DefaultToolbar,
		DrawToolbarItem,
		getEditor,
		HandToolbarItem,
		NoteToolbarItem,
		RectangleToolbarItem,
		SelectToolbarItem,
		SvelteDrawUiMenuGroup,
		TextToolbarItem,
		ToolbarItem,
	} from 'svelte-draw'
	import { getNodeDefinitions } from '../nodes/nodeTypes'
	import TemplatePicker from './TemplatePicker.svelte'

	const editor = getEditor()
	const nodeDefs = Object.values(getNodeDefinitions(editor)).filter((d) => !d.hidden)
</script>

<DefaultToolbar>
	<SvelteDrawUiMenuGroup id="selection">
		<SelectToolbarItem />
		<HandToolbarItem />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="shapes">
		<DrawToolbarItem />
		<NoteToolbarItem />
		<RectangleToolbarItem />
		<TextToolbarItem />
		<AssetToolbarItem />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="nodes">
		{#each nodeDefs as nodeDef (nodeDef.type)}
			<ToolbarItem tool={`node-${nodeDef.type}`} />
		{/each}
	</SvelteDrawUiMenuGroup>
	<TemplatePicker />
	<DefaultQuickActions />
	<DefaultActionsMenu />
</DefaultToolbar>
