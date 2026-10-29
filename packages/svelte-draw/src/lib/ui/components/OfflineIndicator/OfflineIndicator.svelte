<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		statusOffline: { id: 'status.offline', defaultMessage: 'Offline' },
	})
</script>

<script lang="ts">
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiIcon from '../primitives/SvelteDrawUiIcon.svelte'
	import SvelteDrawUiTooltip from '../primitives/SvelteDrawUiTooltip.svelte'

	const msg = getTranslation()
</script>

<SvelteDrawUiTooltip content={msg(messages.statusOffline)}>
	{#snippet child({ props })}
		<div {...props} class="tlui-offline-indicator">
			<SvelteDrawUiIcon icon="status-offline" label={msg(messages.statusOffline)} small />
		</div>
	{/snippet}
</SvelteDrawUiTooltip>
