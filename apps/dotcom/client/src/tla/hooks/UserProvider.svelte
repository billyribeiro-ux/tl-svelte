<script lang="ts">
	import type { Snippet } from 'svelte'
	import { assert, shallowObjectIdentity } from 'svelte-draw'
	import { getAuth, getUser } from '../../utils/clerk.svelte'
	import { getIsSvelteDrawStaff, setSvelteDrawCurrentUser, type SvelteDrawUser } from './useUser.svelte'

	let { children }: { children: Snippet } = $props()

	const clerkUser = getUser()
	const auth = getAuth()
	const user = shallowObjectIdentity(() => clerkUser.current.user)

	// At time of writing, the return value of `useAuth` was not stable during a user session,
	// and was causing downstream react components to remount unnecessarily and lose state.
	// I tracked it down to being useAuth().has which was being updated randomly for some reason.
	// Destructuring the bits we need here fixes the issue as they seem to be stable.
	const getToken = $derived(auth.current.getToken)
	const isSignedIn = $derived(auth.current.isSignedIn)
	const isAuthLoaded = $derived(auth.current.isLoaded)
	const isLoaded = $derived(clerkUser.current.isLoaded)

	// Built from Clerk alone so the sync socket can carry the access token before Zero has
	// resolved. The Clerk id is also the app's userId and the Zero user row id.
	const value = $derived.by<SvelteDrawUser | null>(() => {
		const u = user.current
		if (!u || !isSignedIn) return null
		return {
			id: u.id,
			clerkUser: u,
			isSvelteDraw: getIsSvelteDrawStaff(u),
			getToken: async () => {
				const token = await getToken()
				assert(token)
				return token
			},
		}
	})

	setSvelteDrawCurrentUser({
		get current() {
			return value
		},
	})
</script>

{#if !isLoaded || !isAuthLoaded}
	<!-- Render a blank editor surface while auth loads, with no spinner or fade. -->
	<div class="svelte-draw__editor"></div>
{:else}
	{@render children()}
{/if}
