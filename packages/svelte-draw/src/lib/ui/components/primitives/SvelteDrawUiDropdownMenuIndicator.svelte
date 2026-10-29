<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		uiChecked: { id: 'ui.checked', defaultMessage: 'Checked' },
	})
</script>

<script lang="ts">
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { getDropdownMenuItemChecked } from './dropdownMenuContext'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	const msg = getTranslation()
	const dir = getDirection()
	const getChecked = getDropdownMenuItemChecked()
</script>

<!-- Like Radix's ItemIndicator, only rendered while the surrounding checkbox item is checked. @public -->
{#if getChecked()}
	<SvelteDrawUiIcon dir={dir.current} data-state="checked" label={msg(messages.uiChecked)} icon="check" />
{/if}
