<script lang="ts">
	import { beforeNavigate } from '$app/navigation'
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
	import Head from '../../components/Head/Head.svelte'
	import RefreshErrorBoundary from '../../components/ErrorPage/RefreshErrorBoundary.svelte'
	import { routes } from '../../routeDefs'
	import { initClerk } from '../../utils/clerk.svelte'
	import { bootedOnOAuthConsent } from '../../utils/clerkUi'
	import { showConsoleBranding } from '../../utils/consoleBranding'
	import { fileLoads } from '../../utils/fileLoad'
	import { shouldPrintLoads } from '../../utils/loadTracker'

	let { children }: { children: Snippet } = $props()

	const TOP_LEVEL_ERROR_MESSAGES = {
		header: 'Unable to connect',
		para1:
			'Something went wrong while loading the page. This is usually temporary. Please try refreshing.',
		cta: 'Refresh',
	}

	const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

	if (!PUBLISHABLE_KEY) {
		throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
	}

	// Replaces <ClerkProvider>. The app draws its own auth UI; only the consent page uses Clerk's
	// prebuilt components, hence `prefetchUI`.
	initClerk({
		publishableKey: PUBLISHABLE_KEY,
		prefetchUI: bootedOnOAuthConsent,
		afterSignOutUrl: routes.tlaRoot(),
		signInUrl: '/',
		signInFallbackRedirectUrl: routes.tlaRoot(),
		signUpFallbackRedirectUrl: routes.tlaRoot(),
	})

	// The start of a file switch (the router subscription in main.tsx).
	beforeNavigate(({ to }) => {
		if (to) fileLoads.noteNavigation(to.url.pathname)
	})

	onMount(() => {
		// The banner buries the load timings the debug flag asked for.
		if (!shouldPrintLoads()) showConsoleBranding()
		try {
			// we have a dummy service worker that unregisters itself immediately
			// this was needed to remove the service worker we used to have from the cache
			// we can remove this if we ever need a service worker again, or if enough time passes that
			// anybody returning to svelte-draw.invalid should not have a service worker running
			navigator.serviceWorker.register('/sw.js', {
				scope: '/',
			})
		} catch {
			// ignore
		}
	})
</script>

<RefreshErrorBoundary messages={TOP_LEVEL_ERROR_MESSAGES}>
	<Head />
	{@render children()}
</RefreshErrorBoundary>
