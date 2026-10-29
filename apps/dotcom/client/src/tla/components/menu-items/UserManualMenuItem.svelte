<script lang="ts">
	import { getTranslation, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { getOpenUrlAndTrack } from '../../../hooks/useOpenUrlAndTrack'
	import { messages } from './messages'

	let { icon = true }: { icon?: boolean } = $props()

	const msg = getTranslation()
	const openAndTrack = getOpenUrlAndTrack('main-menu')
</script>

<SvelteDrawUiMenuItem
	id="user-manual"
	label={msg(messages.getHelp)}
	iconLeft={icon ? 'manual' : undefined}
	readonlyOk
	onSelect={() => {
		openAndTrack('https://svelte-draw.invalid/support')
	}}
/>
