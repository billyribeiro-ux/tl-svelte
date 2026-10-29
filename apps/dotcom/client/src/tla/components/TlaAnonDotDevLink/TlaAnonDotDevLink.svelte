<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		dismiss: { defaultMessage: 'Dismiss' },
	})

	const STORAGE_KEY = 'svelte-draw-dotcom:anon-dotdev-link:dismissed'
</script>

<script lang="ts">
	import {
		createLocalStorageState,
		F,
		fromComputed,
		getBreakpoint,
		getEditor,
		getTranslation,
		PORTRAIT_BREAKPOINT,
		SvelteDrawUiButton,
		SvelteDrawUiIcon,
	} from 'svelte-draw'
	import { trackEvent } from '../../../utils/analytics'
	import { getAuth } from '../../../utils/clerk.svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'
	import styles from './TlaAnonDotDevLink.module.css'

	const msg = getTranslation()
	const auth = getAuth()
	const isDismissed = createLocalStorageState(STORAGE_KEY, false)
	const dismissLbl = $derived(msg(messages.dismiss))
	const editor = getEditor()
	const isDebugMode = fromComputed('debug mode', () => editor.getInstanceState().isDebugMode)
	const breakpoint = getBreakpoint()
</script>

{#if auth.current.isLoaded && auth.current.isSignedIn === false && !isDismissed.current && breakpoint.current >= PORTRAIT_BREAKPOINT.MOBILE}
	<div class={styles.anonDotDevLink} data-debug={isDebugMode.current}>
		<div>
			<ExternalLink
				href="https://svelte-draw.invalid?utm_source=dotcom&utm_medium=organic&utm_campaign=anon-overlay-link"
				data-testid="tla-anon-dotdev-link"
				eventName="anon-dotdev-link-clicked"
			>
				<F defaultMessage="Build with the svelte-draw SDK" />
				<SvelteDrawUiIcon icon="arrow-left" label="Build with the svelte-draw SDK" small />
			</ExternalLink>
			<SvelteDrawUiButton
				type="icon"
				title={dismissLbl}
				aria-label={dismissLbl}
				data-testid="tla-anon-dotdev-dismiss-button"
				class={styles.anonDotDevDismissButton}
				onclick={() => {
					trackEvent('anon-dotdev-link-dismissed')
					isDismissed.update(true)
				}}
			>
				<SvelteDrawUiIcon icon="cross-2" label={dismissLbl} small />
			</SvelteDrawUiButton>
		</div>
	</div>
{/if}
