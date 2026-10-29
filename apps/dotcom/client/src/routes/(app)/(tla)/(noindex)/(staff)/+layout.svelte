<script lang="ts">
	import type { Snippet } from 'svelte'
	import { routes } from '../../../../../routeDefs'
	import { getUser } from '../../../../../utils/clerk.svelte'
	import { navigate } from '../../../../../utils/router.svelte'
	import { getIsSvelteDrawStaff } from '../../../../../tla/hooks/useUser.svelte'

	let { children }: { children: Snippet } = $props()

	// Routes under this gate fetch staff-only APIs in their components, not in route loaders. Loaders
	// run before Clerk loads and refreshes the `__session` cookie, so on a cold load their requests
	// carry an expired token and get a 401.
	//
	// Read isLoaded and user from the same Clerk subscription so we never decide
	// staff-ness from a half-loaded user (which would fail closed and bounce staff).
	const clerkUser = getUser()
	const isStaff = $derived(getIsSvelteDrawStaff(clerkUser.current.user))

	$effect(() => {
		if (clerkUser.current.isLoaded && !isStaff) navigate(routes.tlaRoot(), { replace: true })
	})
</script>

{#if clerkUser.current.isLoaded && isStaff}
	{@render children()}
{/if}
