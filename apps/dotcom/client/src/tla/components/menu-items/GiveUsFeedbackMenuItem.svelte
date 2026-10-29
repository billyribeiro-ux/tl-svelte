<script lang="ts">
	import { getDialogs, getTranslation, SvelteDrawUiMenuItem } from 'svelte-draw'
	import SubmitFeedbackDialog from '../dialogs/SubmitFeedbackDialog.svelte'
	import { messages } from './messages'

	const msg = getTranslation()
	const { addDialog } = getDialogs()
</script>

<SvelteDrawUiMenuItem
	id="give-us-feedback"
	label={msg(messages.submitFeedback)}
	iconLeft="comment"
	readonlyOk
	onSelect={() => {
		addDialog({ component: SubmitFeedbackDialog })
	}}
/>
