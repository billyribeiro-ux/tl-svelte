<script lang="ts">
	import {
		DefaultMainMenu,
		DefaultMainMenuContent,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
</script>

<DefaultMainMenu>
	<div style="background-color: thistle;">
		<SvelteDrawUiMenuGroup id="example">
			<SvelteDrawUiMenuItem
				id="like"
				label="Like my posts"
				icon="external-link"
				readonlyOk
				onSelect={() => {
					window.open('https://x.com/svelte-draw', '_blank')
				}}
			/>
		</SvelteDrawUiMenuGroup>
	</div>
	<DefaultMainMenuContent />
</DefaultMainMenu>
