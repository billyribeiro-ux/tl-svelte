<script lang="ts">
	import type { Snippet } from 'svelte'
	import { enMessages } from '../../utils/enMessages'
	import FormattedMessage from '../../utils/FormattedMessage.svelte'
	import IntlProvider from '../../utils/IntlProvider.svelte'
	// The SDK's `F` is what everything else here uses. This page renders when the app has failed, so
	// it is reachable from the entry chunk, and importing the SDK would put the whole editor in front
	// of first paint. Nothing is lost: this page is outside the editor, so the marker span that the
	// language-debug overlay looks for has nothing to act on here.
	import { isInIframe } from '../../utils/iFrame'

	let {
		messages,
		cta,
	}: {
		messages: { header: string; para1: string; para2?: string; cta?: string }
		/**
		 * The call to action under the text. Omit it for the default "Back to svelte-draw" link; pass a
		 * snippet that renders nothing for no call to action (React's `cta={null}`).
		 */
		cta?: Snippet
	} = $props()

	const inIframe = isInIframe()
</script>

<!-- This sits outside the regular providers, it needs to be able to have the intl object in the app context. -->
<IntlProvider locale="en" messages={enMessages}>
	<div class="error-page" data-testid="tla-error">
		<div class="error-page__container">
			<div class="error-page__content">
				<h1>{messages.header}</h1>
				<p>{messages.para1}</p>
				{#if messages.para2}<p>{messages.para2}</p>{/if}
			</div>
			{#if cta}
				{@render cta()}
			{:else}
				<a href="/" target={inIframe ? '_blank' : '_self'}>
					{#if inIframe}
						<FormattedMessage defaultMessage="Open svelte-draw" />
					{:else}
						<FormattedMessage defaultMessage="Back to svelte-draw" />
					{/if}
				</a>
			{/if}
		</div>
	</div>
</IntlProvider>
