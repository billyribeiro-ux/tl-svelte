<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	/** @public */
	export interface TLUiButtonCheckProps {
		checked: boolean
	}

	const messages = defineMessages({
		uiChecked: { id: 'ui.checked', defaultMessage: 'Checked' },
		uiUnchecked: { id: 'ui.unchecked', defaultMessage: 'Unchecked' },
	})
</script>

<script lang="ts">
	import { getTranslation } from '../../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiIcon from '../SvelteDrawUiIcon.svelte'

	let { checked }: TLUiButtonCheckProps = $props()
	const msg = getTranslation()
</script>

<SvelteDrawUiIcon
	data-checked={!!checked}
	label={msg(checked ? messages.uiChecked : messages.uiUnchecked)}
	icon={checked ? 'check' : 'none'}
	class="tlui-button__icon"
	small
/>
