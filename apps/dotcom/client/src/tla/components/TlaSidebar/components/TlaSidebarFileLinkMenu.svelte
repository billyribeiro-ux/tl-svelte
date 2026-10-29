<script lang="ts">
	import { getTranslation, SvelteDrawUiButton } from 'svelte-draw'
	import TlaFileMenu from '../../TlaFileMenu/TlaFileMenu.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { messages } from './sidebar-shared'
	import styles from '../sidebar.module.css'

	let {
		fileId,
		workspaceId,
		onRenameAction,
	}: {
		fileId: string
		workspaceId: string | null
		onRenameAction(): void
	} = $props()

	const msg = getTranslation()
	const fileMenuLbl = $derived(msg(messages.fileMenu))
</script>

<TlaFileMenu {fileId} {workspaceId} source="sidebar" {onRenameAction}>
	{#snippet trigger({ props })}
		<SvelteDrawUiButton
			{...props}
			type="icon"
			class={styles.sidebarFileListItemMenuTrigger}
			tooltip={fileMenuLbl}
			title={fileMenuLbl}
		>
			<TlaIcon icon="dots-vertical-strong" />
		</SvelteDrawUiButton>
	{/snippet}
</TlaFileMenu>
