<script lang="ts">
	import { getTranslation, SvelteDrawUiButton } from 'svelte-draw'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { getHandleSidebarCreateFile } from './getHandleSidebarCreateFile'
	import { messages } from './sidebar-shared'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const createTitle = $derived(msg(messages.create))
	const handleSidebarCreate = getHandleSidebarCreateFile()
</script>

<SvelteDrawUiButton
	type="icon"
	class={styles.sidebarCreateFileButton}
	onclick={handleSidebarCreate}
	data-testid="tla-create-file"
	tooltip={createTitle}
	title={createTitle}
>
	<TlaIcon icon="edit-strong" style="left: 1px" />
</SvelteDrawUiButton>
