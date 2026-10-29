<script lang="ts">
	import {
		DefaultContextMenu,
		DefaultContextMenuContent,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
		type TLUiContextMenuProps,
	} from 'svelte-draw'

	// Spread everything but `children`: this component supplies its own.
	const { children: _children, ...props }: TLUiContextMenuProps = $props()
</script>

<DefaultContextMenu {...props}>
	<SvelteDrawUiMenuGroup id="example">
		<div style="background-color: thistle;">
			<SvelteDrawUiMenuItem
				id="like"
				label="Like my posts"
				icon="external-link"
				readonlyOk
				onSelect={() => {
					window.open('https://x.com/svelte-draw', '_blank')
				}}
			/>
		</div>
	</SvelteDrawUiMenuGroup>
	<DefaultContextMenuContent />
</DefaultContextMenu>
