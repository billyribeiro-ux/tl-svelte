<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		a11yStatus: { id: 'a11y.status', defaultMessage: 'Status' },
	})
</script>

<script lang="ts">
	import { fromSignal } from '@svelte-draw/svelte'
	import { getA11y } from '../context/a11y'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import { setupA11yDebug, setupSelectedShapesAnnouncer } from './a11yAnnouncements.svelte'

	/** @public */
	const a11y = getA11y()
	const translation = getTranslation()
	const msg = fromSignal(a11y.currentMsg)
	setupA11yDebug(() => msg.current.msg)

	setupSelectedShapesAnnouncer()
</script>

{#if msg.current.msg}
	<div
		aria-label={translation(messages.a11yStatus.id)}
		aria-live={msg.current.priority || 'assertive'}
		role="status"
		aria-hidden="false"
		style="position: absolute; top: -10000px; left: -10000px;"
	>
		{msg.current.msg}
	</div>
{/if}
