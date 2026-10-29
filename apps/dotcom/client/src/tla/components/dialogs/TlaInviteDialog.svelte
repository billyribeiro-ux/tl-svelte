<script lang="ts">
	import type { GetInviteInfoResponseBody } from '@svelte-draw/dotcom-shared'
	import {
		F,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import styles from './TlaInviteDialog.module.css'

	let {
		inviteInfo,
		onClose,
	}: {
		inviteInfo: Extract<GetInviteInfoResponseBody, { error: false }>
		onClose(): void
	} = $props()

	const app = getMaybeApp()
	let isAccepting = $state(false)
</script>

{#snippet strong(chunks: string)}
	<strong>
		<br />
		{chunks}
	</strong>
{/snippet}

<SvelteDrawUiDialogHeader class={styles.dialogHeader}>
	<SvelteDrawUiDialogTitle>
		<span></span>
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody class={styles.dialogBody}>
	<div class={styles.message}>
		<F
			defaultMessage={"You have been invited to join <strong>{workspaceName}</strong>."}
			values={{ workspaceName: inviteInfo.workspaceName }}
			tags={{ strong }}
		/>
	</div>

	<button
		class={styles.acceptButton}
		disabled={isAccepting}
		onclick={async () => {
			const currentApp = app.current
			if (!currentApp) return
			isAccepting = true
			await currentApp.acceptWorkspaceInvite(inviteInfo.inviteSecret).finally(() => {
				isAccepting = false
			})
			onClose()
		}}
	>
		<F defaultMessage="Accept invitation" />
	</button>
</SvelteDrawUiDialogBody>
