<script lang="ts">
	import {
		DefaultDebugMenu,
		DefaultDebugMenuContent,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
</script>

<div style="background-color: thistle;">
	<DefaultDebugMenu>
		<DefaultDebugMenuContent />
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
	</DefaultDebugMenu>
</div>
