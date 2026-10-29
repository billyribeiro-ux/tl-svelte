<script lang="ts">
	import {
		F,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import SadFaceIcon from '../../../components/ErrorPage/SadFaceIcon.svelte'
	import TlaButton from '../TlaButton/TlaButton.svelte'
	import styles from './TlaInviteExpiredDialog.module.css'

	let { onClose }: { onClose(): void } = $props()
</script>

<SvelteDrawUiDialogHeader class={styles.dialogHeader}>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody class={styles.dialogBody}>
	<SadFaceIcon />
	<SvelteDrawUiDialogTitle class={styles.header}>
		<F defaultMessage="This invite link has expired" />
	</SvelteDrawUiDialogTitle>
	<p class={styles.message}>
		<F defaultMessage="Ask the workspace owner for a new one." />
	</p>
	<TlaButton variant="cta" class={styles.okButton} onclick={onClose}>
		<F defaultMessage="OK" />
	</TlaButton>
</SvelteDrawUiDialogBody>
