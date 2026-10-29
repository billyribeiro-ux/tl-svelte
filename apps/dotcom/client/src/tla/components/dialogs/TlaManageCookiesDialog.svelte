<script lang="ts" module>
	const COOKIE_POLICY_URL = '/cookies.html'
</script>

<script lang="ts">
	import { Tooltip } from 'bits-ui'
	import {
		F,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { getAnalyticsConsent } from '../../hooks/useAnalyticsConsent.svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'
	import {
		TlaMenuControl,
		TlaMenuControlGroup,
		TlaMenuControlInfoTooltip,
		TlaMenuControlLabel,
		TlaMenuSwitch,
	} from '../tla-menu/tla-menu.svelte'
	import styles from './dialogs.module.css'

	// The dialog host passes `onClose`; this dialog closes through its header button only.
	let {}: { onClose?(): void } = $props()

	const consent = getAnalyticsConsent()
</script>

{#snippet a(chunks: string)}
	<ExternalLink href={COOKIE_POLICY_URL}>{chunks}</ExternalLink>
{/snippet}

<Tooltip.Provider>
	<div class={styles.dialogContainer}>
		<SvelteDrawUiDialogHeader>
			<SvelteDrawUiDialogTitle>
				<F defaultMessage="Manage cookies" />
			</SvelteDrawUiDialogTitle>
			<SvelteDrawUiDialogCloseButton />
		</SvelteDrawUiDialogHeader>
		<SvelteDrawUiDialogBody class={styles.dialogBody}>
			<p>
				<F
					defaultMessage="We use cookies to keep you logged in, to sync your files, and to collect analytics to help us improve svelte-draw."
				/>
			</p>
			<TlaMenuControlGroup>
				<TlaMenuControl>
					<TlaMenuControlLabel htmlFor="tla-essential-cookies-switch">
						<F defaultMessage="Essential cookies" />
					</TlaMenuControlLabel>
					<TlaMenuControlInfoTooltip showOnMobile>
						<F defaultMessage="We use these cookies to save your files and settings." />
					</TlaMenuControlInfoTooltip>
					<TlaMenuSwitch id="tla-essential-cookies-switch" checked={true} disabled />
				</TlaMenuControl>
				<TlaMenuControl>
					<TlaMenuControlLabel htmlFor="tla-analytics-switch">
						<F defaultMessage="Analytics" />
					</TlaMenuControlLabel>
					<TlaMenuControlInfoTooltip showOnMobile>
						<F defaultMessage="We use analytics cookies to make svelte-draw better." />
					</TlaMenuControlInfoTooltip>
					<TlaMenuSwitch
						id="tla-analytics-switch"
						checked={consent.current === true}
						onChange={() => consent.update(!(consent.current === true))}
					/>
				</TlaMenuControl>
			</TlaMenuControlGroup>
			<p>
				<F defaultMessage="Read our <a>cookie policy</a> to learn more." tags={{ a }} />
			</p>
		</SvelteDrawUiDialogBody>
	</div>
</Tooltip.Provider>
