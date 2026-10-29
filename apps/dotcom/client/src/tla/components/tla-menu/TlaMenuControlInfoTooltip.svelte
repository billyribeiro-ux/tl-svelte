<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		help: { defaultMessage: 'Help' },
	})
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import type { Snippet } from 'svelte'
	import {
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiIcon,
		SvelteDrawUiTooltip,
	} from 'svelte-draw'
	import styles from './menu.module.css'

	// An info button for a single control. `children` is the tooltip content.
	let {
		href,
		onclick,
		children,
		showOnMobile,
	}: {
		href?: string
		onclick?(): void
		children: Snippet
		showOnMobile?: boolean
	} = $props()

	const msg = getTranslation()
	const helpMsg = $derived(msg(messages.help))
</script>

<div class={styles.menuInfoTriggerContainer}>
	<SvelteDrawUiTooltip content={children} {showOnMobile} delayDuration={0}>
		{#snippet child({ props })}
			{#if href}
				<a
					{...mergeProps(props, { onclick: () => onclick?.() })}
					{href}
					target="_blank"
					rel="noopener noreferrer nofollow"
					class={styles.menuInfoTrigger}
				>
					<SvelteDrawUiIcon label={helpMsg} icon="help-circle" small />
				</a>
			{:else}
				<SvelteDrawUiButton type="icon" class={styles.menuInfoTrigger} {...props}>
					<SvelteDrawUiIcon label={helpMsg} icon="help-circle" small />
				</SvelteDrawUiButton>
			{/if}
		{/snippet}
	</SvelteDrawUiTooltip>
</div>
