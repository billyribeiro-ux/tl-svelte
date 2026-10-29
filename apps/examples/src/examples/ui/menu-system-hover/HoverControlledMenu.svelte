<script lang="ts">
	import {
		createMenuIsOpen,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuItem,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
	} from 'svelte-draw'

	// [1]
	const editor = getEditor()
	const menu = createMenuIsOpen('hover-menu')
</script>

<div class="hover-menu-container">
	<!-- [2] -->
	<div
		class="hover-zone hover-zone-open"
		role="presentation"
		onmouseenter={() => editor.menus.addOpenMenu('hover-menu')}
	>
		Hover to open menu
	</div>

	<!-- [3] -->
	<div
		class="hover-zone hover-zone-close"
		role="presentation"
		onmouseenter={() => editor.menus.deleteOpenMenu('hover-menu')}
	>
		Hover to close menu
	</div>

	<!-- [4] -->
	<SvelteDrawUiDropdownMenuRoot id="hover-menu">
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton type="normal" {...props}>
					<SvelteDrawUiButtonLabel>
						Menu {menu.isOpen ? '(open)' : '(closed)'}
					</SvelteDrawUiButtonLabel>
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<SvelteDrawUiDropdownMenuContent>
			{#each [1, 2, 3] as n (n)}
				<SvelteDrawUiDropdownMenuItem>
					{#snippet child({ props })}
						<SvelteDrawUiButton type="menu" {...props}>
							<SvelteDrawUiButtonLabel>Menu item {n}</SvelteDrawUiButtonLabel>
						</SvelteDrawUiButton>
					{/snippet}
				</SvelteDrawUiDropdownMenuItem>
			{/each}
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiDropdownMenuRoot>
</div>
