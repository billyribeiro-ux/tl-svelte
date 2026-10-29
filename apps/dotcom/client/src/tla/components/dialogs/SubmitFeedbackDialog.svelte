<script lang="ts">
	import { getAuth } from '../../../utils/clerk.svelte'
	import SignedInSubmitFeedbackDialog from './SignedInSubmitFeedbackDialog.svelte'
	import SignedOutSubmitFeedbackDialog from './SignedOutSubmitFeedbackDialog.svelte'

	let { onClose }: { onClose(): void } = $props()

	const auth = getAuth()
</script>

{#if auth.current.isSignedIn}
	<SignedInSubmitFeedbackDialog {onClose} />
{:else}
	<SignedOutSubmitFeedbackDialog />
{/if}
