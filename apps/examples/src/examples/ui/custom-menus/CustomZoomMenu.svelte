<script lang="ts">
	import {
		DefaultZoomMenu,
		DefaultZoomMenuContent,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
</script>

<DefaultZoomMenu>
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
	<DefaultZoomMenuContent />
</DefaultZoomMenu>
