<script lang="ts">
	import {
		AssetToolbarItem,
		CheckBoxToolbarItem,
		CloudToolbarItem,
		DefaultToolbar,
		DiamondToolbarItem,
		DrawToolbarItem,
		EllipseToolbarItem,
		HandToolbarItem,
		HeartToolbarItem,
		HexagonToolbarItem,
		HighlightToolbarItem,
		LaserToolbarItem,
		NoteToolbarItem,
		OvalToolbarItem,
		RectangleToolbarItem,
		RhombusToolbarItem,
		SelectToolbarItem,
		StarToolbarItem,
		SvelteDrawUiMenuGroup,
		TextToolbarItem,
		ToolbarItem,
		TriangleToolbarItem,
		XBoxToolbarItem,
	} from 'svelte-draw'
	import MathematicalToolbarItem from './MathematicalToolbarItem.svelte'
</script>

<DefaultToolbar orientation="vertical" maxItems={8}>
	<SvelteDrawUiMenuGroup id="selection">
		<SelectToolbarItem />
		<HandToolbarItem />
		<DrawToolbarItem />
		<NoteToolbarItem />
	</SvelteDrawUiMenuGroup>

	<SvelteDrawUiMenuGroup id="nodes">
		<MathematicalToolbarItem />
		<ToolbarItem tool="node-slider" />
		<ToolbarItem tool="node-conditional" />
		<ToolbarItem tool="node-earthquake" />
	</SvelteDrawUiMenuGroup>

	<SvelteDrawUiMenuGroup id="shapes">
		<RectangleToolbarItem />
		<EllipseToolbarItem />
		<TriangleToolbarItem />
		<DiamondToolbarItem />

		<HexagonToolbarItem />
		<OvalToolbarItem />
		<RhombusToolbarItem />
		<StarToolbarItem />

		<CloudToolbarItem />
		<HeartToolbarItem />
		<XBoxToolbarItem />
		<CheckBoxToolbarItem />

		<TextToolbarItem />
		<AssetToolbarItem />
		<HighlightToolbarItem />
		<LaserToolbarItem />
	</SvelteDrawUiMenuGroup>
</DefaultToolbar>
