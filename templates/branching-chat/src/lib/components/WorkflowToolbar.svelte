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
</script>

<DefaultToolbar orientation="vertical" maxItems={7}>
	<SvelteDrawUiMenuGroup id="selection">
		<SelectToolbarItem />
		<HandToolbarItem />
		<DrawToolbarItem />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="nodes">
		<ToolbarItem tool="node-message" />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="shapes">
		<RectangleToolbarItem />
		<EllipseToolbarItem />
		<TriangleToolbarItem />
		<NoteToolbarItem />

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
