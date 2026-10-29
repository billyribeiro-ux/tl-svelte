<script lang="ts">
	import { DefaultActionsMenu, DefaultQuickActions, SvelteDrawUiToolbar } from 'svelte-draw'
	import WorkflowToolbar from './WorkflowToolbar.svelte'
</script>

<WorkflowToolbar />
<div class="tlui-main-toolbar tlui-main-toolbar--horizontal">
	<SvelteDrawUiToolbar class="tlui-main-toolbar__tools" label="Actions">
		<DefaultQuickActions />
		<DefaultActionsMenu />
	</SvelteDrawUiToolbar>
</div>
