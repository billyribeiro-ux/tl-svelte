<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		DefaultA11yAnnouncer,
		DefaultDialogs,
		DefaultToasts,
		setContainer,
		SvelteDrawUiContextProvider,
		type TLUiEventHandler,
		type TLUiOverrides,
	} from 'svelte-draw'
	import { assetUrls } from '../../utils/assetUrls'
	import { getIntl } from '../../utils/intl'
	import { getGlobalEditor } from '../../utils/globalEditor'
	import TlaCookieConsent from '../components/dialogs/TlaCookieConsent.svelte'
	import { components } from '../components/TlaEditor/TlaEditor.svelte'
	import WorkspaceInviteHandler from '../components/WorkspaceInviteHandler.svelte'
	import PutI18nInApp from './PutI18nInApp.svelte'
	import PutToastsInApp from './PutToastsInApp.svelte'

	let { container, children }: { container: HTMLElement; children: Snippet } = $props()

	// The container never changes for the life of this component (the parent only renders it once it
	// exists), so reading it once is the right amount of reactivity.
	// svelte-ignore state_referenced_locally
	setContainer(container)

	const handleAppLevelUiEvent: TLUiEventHandler = () => {
		// todo, implement handling ui events at the application layer
	}

	const currentEditor = getGlobalEditor()
	const intl = getIntl()

	// dotcom's own compiled messages reach `getTranslation()` through the provider's overrides:
	// react-intl's IntlProvider used to be the app-level catalog the SDK merged in; there is none in
	// Svelte. The catalog holds precompiled ICU ASTs, which the SDK's formatter accepts although its
	// override type says string.
	const overrides = $derived<TLUiOverrides>({
		translations: {
			[intl.current.locale]: intl.current.messages as unknown as Record<string, string>,
		},
	})
</script>

<SvelteDrawUiContextProvider {assetUrls} {components} {overrides} onUiEvent={handleAppLevelUiEvent}>
	<PutI18nInApp />
	{@render children()}
	<DefaultDialogs />
	<DefaultToasts />
	<DefaultA11yAnnouncer />
	<PutToastsInApp />
	<WorkspaceInviteHandler />
	{#if currentEditor.current}<TlaCookieConsent />{/if}
</SvelteDrawUiContextProvider>
