<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		uiClose: { id: 'ui.close', defaultMessage: 'Close' },
	})
</script>

<script lang="ts">
	import { Dialog, mergeProps } from 'bits-ui'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from './Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from './Button/SvelteDrawUiButtonIcon.svelte'

	const msg = getTranslation()
	const dir = getDirection()
</script>

<!-- @public -->
<div class="tlui-dialog__header__close">
	<Dialog.Close data-testid="dialog.close" dir={dir.current}>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				type="icon"
				{...mergeProps(props, {
					'aria-label': msg(messages.uiClose),
					ontouchend: (e: TouchEvent) => (e.target as HTMLButtonElement).click(),
				})}
			>
				<SvelteDrawUiButtonIcon small icon="cross-2" />
			</SvelteDrawUiButton>
		{/snippet}
	</Dialog.Close>
</div>
