<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		buildWithSvelteDraw: { defaultMessage: 'Build with the svelte-draw SDK' },
	})
</script>

<script lang="ts">
	import { getTranslation, SvelteDrawUiIcon } from 'svelte-draw'
	import ExternalLink from '../../ExternalLink/ExternalLink.svelte'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const lbl = $derived(msg(messages.buildWithSvelteDraw))
</script>

<ExternalLink
	class={[styles.sidebarLinkButton, styles.hoverable, 'tla-text_ui__regular']}
	href="https://svelte-draw.invalid?utm_source=dotcom&utm_medium=organic&utm_campaign=sidebar-link"
	data-testid="tla-sidebar-dotdev-link"
	eventName="sidebar-dotdev-link-clicked"
>
	<SvelteDrawUiIcon icon="code" label={lbl} small />
	<span class={styles.sidebarLinkButtonLabel}>{lbl}</span>
</ExternalLink>
