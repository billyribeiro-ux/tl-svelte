<script lang="ts" module>
	import { markFirstLoad } from '../../utils/firstLoad'

	markFirstLoad('root-chunk-loaded')

	function getTextDirection(locale: string): 'ltr' | 'rtl' {
		const [language] = locale.toLowerCase().split('-')
		return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fromComputed, react, RTL_LANGUAGES, tlenvReactive } from 'svelte-draw'
	import ErrorBoundary from '../../components/ErrorPage/RefreshErrorBoundary.svelte'
	import { globalEditor } from '../../utils/globalEditor'
	import MaybeForceUserRefresh from '../components/MaybeForceUserRefresh/MaybeForceUserRefresh.svelte'
	import { getLocalSessionState } from '../utils/local-session-state'
	import '../styles/tla.css'
	import AppGate from './AppGate.svelte'
	import InsideOfContainerContext from './InsideOfContainerContext.svelte'
	import IntlWrapper from './IntlWrapper.svelte'
	import LegalTermsAcceptance from './LegalTermsAcceptance.svelte'
	import SignedInProvider from './SignedInProvider.svelte'
	import WatermarkOverride from './WatermarkOverride.svelte'

	/**
	 * The providers every signed-in-or-out tla route sits in. Was `TlaRootProviders.tsx`'s `Component`
	 * (the route element wrapping an `<Outlet />`); `children` is the page.
	 */
	let { children }: { children: Snippet } = $props()

	const CLERK_ERROR_MESSAGES = {
		header: 'Unable to connect',
		para1:
			"We're having trouble connecting to our authentication service. This is usually temporary. Please try refreshing the page.",
		cta: 'Refresh',
	}

	let container = $state<HTMLElement | null>(null)
	// TODO: this needs to default to the global setting of whatever the last chosen locale was, not 'en'
	let locale = $state<string>('en')
	let theme = $state<'light' | 'dark' | 'system'>(getLocalSessionState().theme)
	const dir = $derived(getTextDirection(locale))

	function handleLocaleChange(next: string) {
		locale = next
		document.documentElement.lang = next
		document.documentElement.dir = getTextDirection(next)
	}

	const isFocusMode = fromComputed(
		'isFocusMode',
		() => !!globalEditor.get()?.getInstanceState().isFocusMode
	)

	// Set the data-coarse attribute on the container based on the pointer type. Was a layout effect
	// because there must not be any perceptible delay between the container mounting and this
	// attribute being applied, because styles may depend on it.
	$effect.pre(() => {
		const el = container
		if (!el) return
		return react('coarsePointer', () => {
			el.setAttribute('data-coarse', String(tlenvReactive.get().isCoarsePointer))
		})
	})
</script>

<div
	bind:this={container}
	{dir}
	class={[
		'tla tl-container tla-theme-container',
		theme === 'light' ? 'tla-theme__light tl-theme__light' : 'tla-theme__dark tl-theme__dark',
		isFocusMode.current && 'tla-focus-mode',
	]}
>
	<ErrorBoundary messages={CLERK_ERROR_MESSAGES}>
		<IntlWrapper {locale}>
			<MaybeForceUserRefresh>
				<SignedInProvider onThemeChange={(t) => (theme = t)} onLocaleChange={handleLocaleChange}>
					{#if container}
						<InsideOfContainerContext {container}>
							<AppGate>
								{@render children()}
							</AppGate>
							<LegalTermsAcceptance />
						</InsideOfContainerContext>
					{/if}
				</SignedInProvider>
			</MaybeForceUserRefresh>
		</IntlWrapper>
	</ErrorBoundary>
	<WatermarkOverride />
</div>
