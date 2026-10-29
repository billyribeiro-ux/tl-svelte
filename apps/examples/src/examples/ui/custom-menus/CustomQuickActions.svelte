<script lang="ts">
	import { DefaultQuickActions, DefaultQuickActionsContent, SvelteDrawUiMenuItem } from 'svelte-draw'
</script>

<DefaultQuickActions>
	<DefaultQuickActionsContent />
	<div style="background-color: thistle;">
		<SvelteDrawUiMenuItem id="code" icon="code" onSelect={() => window.alert('code')} />
	</div>
</DefaultQuickActions>
