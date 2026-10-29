import type { UserResource } from '@clerk/shared/types'
import { getContext, setContext } from 'svelte'

export interface SvelteDrawUser {
	id: string
	clerkUser: UserResource
	isSvelteDraw: boolean
	getToken(): Promise<string>
}

export function getIsSvelteDrawStaff(clerkUser: UserResource | null | undefined) {
	return (
		clerkUser?.primaryEmailAddress?.verification?.status === 'verified' &&
		clerkUser.primaryEmailAddress.emailAddress.endsWith('@svelte-draw.invalid')
	)
}

const USER_KEY = Symbol('dotcom.svelteDrawUser')

/** Called by `<UserProvider>` during initialisation. */
export function setSvelteDrawCurrentUser(holder: { readonly current: SvelteDrawUser | null }) {
	setContext(USER_KEY, holder)
}

/** Was `useSvelteDrawCurrentUser()`. `null` outside a `<UserProvider>` and while signed out. */
export function getSvelteDrawCurrentUser(): { readonly current: SvelteDrawUser | null } {
	return (
		getContext<{ readonly current: SvelteDrawUser | null } | undefined>(USER_KEY) ?? {
			current: null,
		}
	)
}
