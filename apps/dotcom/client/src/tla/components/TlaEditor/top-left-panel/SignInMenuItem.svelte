<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		signIn: { defaultMessage: 'Sign in' },
	})
</script>

<script lang="ts">
	import {
		getDialogs,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
	} from 'svelte-draw'
	import TlaSignInDialog from '../../dialogs/TlaSignInDialog.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'

	const msg = getTranslation()
	const { addDialog } = getDialogs()
</script>

<SvelteDrawUiButton
	type="menu"
	data-testid="tla-sign-in-menu-button"
	onclick={() => {
		addDialog({ component: TlaSignInDialog })
	}}
>
	<SvelteDrawUiButtonLabel>{msg(messages.signIn)}</SvelteDrawUiButtonLabel>
	<TlaIcon icon="sign-in" />
</SvelteDrawUiButton>
