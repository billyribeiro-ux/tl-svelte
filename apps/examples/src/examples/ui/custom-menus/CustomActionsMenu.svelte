<script lang="ts">
	import { DefaultActionsMenu, DefaultActionsMenuContent, SvelteDrawUiMenuItem } from 'svelte-draw'
</script>

<div style="background-color: thistle;">
	<DefaultActionsMenu>
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
		<DefaultActionsMenuContent />
	</DefaultActionsMenu>
</div>
