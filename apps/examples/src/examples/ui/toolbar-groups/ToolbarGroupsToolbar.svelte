<script lang="ts">
	import {
		ArrowDownToolbarItem,
		ArrowLeftToolbarItem,
		ArrowRightToolbarItem,
		ArrowUpToolbarItem,
		CloudToolbarItem,
		DefaultToolbar,
		DiamondToolbarItem,
		DrawToolbarItem,
		EllipseToolbarItem,
		EraserToolbarItem,
		HandToolbarItem,
		HexagonToolbarItem,
		HighlightToolbarItem,
		LaserToolbarItem,
		OvalToolbarItem,
		RectangleToolbarItem,
		RhombusToolbarItem,
		SelectToolbarItem,
		StarToolbarItem,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
		TriangleToolbarItem,
	} from 'svelte-draw'
	import { toolbarState } from './toolbarState.svelte'
</script>

{#snippet rotateIcon({ props }: { props: Record<string, unknown> })}
	<span {...props} style:font-size="2em">🔄</span>
{/snippet}

<DefaultToolbar orientation={toolbarState.orientation}>
	<!-- [2] -->
	<SvelteDrawUiMenuGroup id="orientation">
		<SvelteDrawUiMenuItem
			id="orientation"
			onSelect={() => {
				toolbarState.orientation =
					toolbarState.orientation === 'horizontal' ? 'vertical' : 'horizontal'
			}}
			label="Toggle orientation"
			icon={rotateIcon}
		/>
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="controls">
		<SelectToolbarItem />
		<HandToolbarItem />
		<EraserToolbarItem />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="pens">
		<DrawToolbarItem />
		<HighlightToolbarItem />
		<LaserToolbarItem />
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
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="arrows">
		<ArrowLeftToolbarItem />
		<ArrowUpToolbarItem />
		<ArrowDownToolbarItem />
		<ArrowRightToolbarItem />
	</SvelteDrawUiMenuGroup>
</DefaultToolbar>

<!--
[2]
`SvelteDrawUiMenuGroup` draws a divider between groups of items. Any menu item works
inside the toolbar, not just tool items; here the first group is a plain
`SvelteDrawUiMenuItem` that flips the toolbar's orientation. Try it: the groups
stack vertically and the overflow menu moves with them.
-->
