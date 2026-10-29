<script lang="ts">
	import { getTranslation, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { getOpenUrlAndTrack } from '../../../hooks/useOpenUrlAndTrack'
	import { messages } from './messages'

	const msg = getTranslation()
	const openAndTrack = getOpenUrlAndTrack('main-menu')
</script>

<SvelteDrawUiMenuItem
	id="tos"
	label={msg(messages.legalSummary)}
	readonlyOk
	onSelect={() => {
		openAndTrack('/legal.html')
	}}
/>
