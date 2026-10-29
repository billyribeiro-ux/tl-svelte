<script lang="ts">
	import type { Snippet } from 'svelte'
	import { matchPath, ROUTES } from '../../routeDefs'
	import { location } from '../../utils/router.svelte'
	import { getIsAppLoading } from '../hooks/useAppState.svelte'

	/**
	 * Holds routes back until the app resolves unless the matched route opts in (the root and file
	 * routes: they open the sync socket while Zero is still preloading and cope with a null app).
	 * Anything else calling `getApp()` would otherwise throw.
	 *
	 * The opt-in used to be a `handle: { rendersWhileAppLoads: true }` on the React Router route;
	 * SvelteKit routes have no `handle`, so the two routes are named here, with the same matching
	 * rules (`matchPath`) the route table used.
	 */
	let { children }: { children: Snippet } = $props()

	const RENDERS_WHILE_APP_LOADS = [ROUTES.tlaRoot, ROUTES.tlaFile] as const

	const isAppLoading = getIsAppLoading()
	const rendersWhileAppLoads = $derived(
		RENDERS_WHILE_APP_LOADS.some((pattern) => matchPath(pattern, location.pathname))
	)
</script>

{#if !(isAppLoading.current && !rendersWhileAppLoads)}
	{@render children()}
{/if}
