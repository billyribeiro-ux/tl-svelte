<script lang="ts">
	import { getDialogs, getTranslation, SvelteDrawUiMenuItem } from 'svelte-draw'
	import TlaManageCookiesDialog from '../dialogs/TlaManageCookiesDialog.svelte'
	import { messages } from './messages'

	const msg = getTranslation()
	const { addDialog } = getDialogs()
</script>

<SvelteDrawUiMenuItem
	id="cookie-consent"
	label={msg(messages.manageCookies)}
	readonlyOk
	onSelect={() => {
		addDialog({ component: TlaManageCookiesDialog })
	}}
/>
