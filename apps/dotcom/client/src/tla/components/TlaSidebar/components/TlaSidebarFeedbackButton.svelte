<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		submitFeedback: { defaultMessage: 'Send feedback' },
	})
</script>

<script lang="ts">
	import { getDialogs, getTranslation } from 'svelte-draw'
	import SubmitFeedbackDialog from '../../dialogs/SubmitFeedbackDialog.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const { addDialog } = getDialogs()
</script>

<button
	class={[styles.sidebarLinkButton, styles.hoverable, 'tla-text_ui__regular']}
	data-testid="tla-sidebar-feedback-button"
	onclick={() => {
		addDialog({ component: SubmitFeedbackDialog })
	}}
>
	<TlaIcon icon="feedback" />
	<span class={styles.sidebarLinkButtonLabel}>{msg(messages.submitFeedback)}</span>
</button>
