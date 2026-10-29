import { Clerk } from '@clerk/clerk-js'
import { createCheckAuthorization, resolveAuthState } from '@clerk/shared/authorization'
import { deriveState } from '@clerk/shared/deriveState'
import { loadClerkUIScript } from '@clerk/shared/loadClerkJsScript'
import type {
	ClerkOptions,
	ClerkStatus,
	GetTokenOptions,
	Resources,
	SetActiveParams,
	SignInResource,
	SignOut,
	UserResource,
} from '@clerk/shared/types'

/*
 * Clerk for Svelte.
 *
 * `@clerk/react` was a thin layer over `@clerk/clerk-js`: a provider that builds and loads the
 * `Clerk` singleton, and hooks (`useAuth`, `useUser`, `useClerk`, `useSignIn`) that subscribe to it
 * with `clerk.addListener`. This module is the same layer with a Svelte state holder in place of
 * React context, written against `@clerk/clerk-js` and the pure helpers of `@clerk/shared` that
 * `@clerk/react` itself uses (`deriveState`, `resolveAuthState`), so the derived auth values are the
 * same ones the React hooks produced.
 *
 * UNVERIFIED: nothing here has run against a real Clerk instance (no publishable key is available
 * to the porting agent). Each path is a line-for-line port of the `@clerk/react` 6.17.6 source noted
 * in the comments.
 */

const SERVER_ONLY = 'Clerk is only available in the browser'

type UiConstructor = NonNullable<NonNullable<ClerkOptions['ui']>['ClerkUI']>

export type ClerkBootOptions = ClerkOptions & {
	publishableKey: string
	/**
	 * Load Clerk's prebuilt UI bundle (`@clerk/ui`, from Clerk's CDN) together with clerk-js. Only the
	 * OAuth consent page needs it, and the bundle is not small, so the default is off. Same meaning as
	 * `<ClerkProvider prefetchUI>`.
	 */
	prefetchUI?: boolean
}

/** What `useAuth()` returns. */
export type AuthState = ReturnType<typeof resolveAuthState> & object

/** What `useUser()` returns. */
export type UserState =
	| { isLoaded: false; isSignedIn: undefined; user: undefined }
	| { isLoaded: true; isSignedIn: false; user: null }
	| { isLoaded: true; isSignedIn: true; user: UserResource }

/** What the legacy `useSignIn()` returns. */
export type SignInState =
	| { isLoaded: false; signIn: undefined; setActive: undefined }
	| { isLoaded: true; signIn: SignInResource; setActive: Clerk['setActive'] }

// `clerk.status` once the instance has settled. React's `clerkLoaded()` waits for either.
function isSettled(status: ClerkStatus) {
	return status === 'ready' || status === 'degraded'
}

class ClerkState {
	/** The singleton, once {@link initClerk} has built it. Not reactive: use {@link loaded}. */
	instance: Clerk | null = null
	#status = $state<ClerkStatus>('loading')
	// Replaced (new object) on every emission of `clerk.addListener`, the same snapshot React read
	// through `useSyncExternalStore` (`clerk.__internal_lastEmittedResources`).
	#resources = $state.raw<Resources | undefined>(undefined)
	#loaded = $state(false)
	#options: ClerkBootOptions | null = null
	#waiters: Array<() => void> = []

	get status(): ClerkStatus {
		return this.#status
	}

	get loaded() {
		return this.#loaded
	}

	get resources() {
		return this.#resources
	}

	get options() {
		return this.#options
	}

	/** Mirrors `IsomorphicClerk.getEntryChunks` for a standard browser. Safe to call twice. */
	boot(options: ClerkBootOptions) {
		if (typeof window === 'undefined') throw new Error(SERVER_ONLY)
		if (this.instance) return
		this.#options = options
		const { publishableKey, prefetchUI, ...clerkOptions } = options

		// `IsomorphicClerk` leaves these for clerk-js's own bootstrap code. The app configures
		// neither a proxy nor a satellite domain, so both are empty.
		const w = window as unknown as Record<string, unknown>
		w.__clerk_publishable_key = publishableKey
		w.__clerk_proxy_url = ''
		w.__clerk_domain = ''

		const clerk = new Clerk(publishableKey)
		this.instance = clerk
		clerk.on(
			'status',
			(status) => {
				this.#status = status
				if (isSettled(status)) this.#flushWaiters()
			},
			{ notify: true }
		)

		this.#load(clerk, publishableKey, clerkOptions, !!prefetchUI).catch((err) => {
			// The same terminal state `<ClerkProvider>` reaches: the status flips to 'error' and the
			// `SignedInProvider` timeout renders the "Unable to connect" page.
			this.#status = 'error'
			console.error(err instanceof Error ? err.stack || err.message : err)
		})
	}

	async #load(clerk: Clerk, publishableKey: string, clerkOptions: ClerkOptions, withUi: boolean) {
		let ClerkUI: UiConstructor | undefined
		if (withUi) {
			await loadClerkUIScript({ publishableKey })
			ClerkUI = (globalThis as { __internal_ClerkUICtor?: UiConstructor }).__internal_ClerkUICtor
			if (!ClerkUI)
				throw new Error('Failed to download latest Clerk UI. Contact support@clerk.com.')
		}

		if (!clerk.loaded) {
			await clerk.load({ ...clerkOptions, ui: { ...clerkOptions.ui, ClerkUI } })
		}
		if (!clerk.loaded) return

		// `skipInitialEmit` because the snapshot is read directly below: the listener's first emission
		// would otherwise race it for the same value.
		clerk.addListener(
			(resources) => {
				this.#resources = resources
			},
			{ skipInitialEmit: true }
		)
		this.#resources = clerk.__internal_lastEmittedResources
		this.#status = clerk.status
		this.#loaded = true
		this.#flushWaiters()
	}

	#flushWaiters() {
		const waiters = this.#waiters
		this.#waiters = []
		for (const wake of waiters) wake()
	}

	/** Resolves once clerk-js has settled (`ready` or `degraded`). React's `clerkLoaded()`. */
	whenSettled(): Promise<void> {
		if (this.instance && isSettled(this.instance.status)) return Promise.resolve()
		return new Promise((resolve) => this.#waiters.push(resolve))
	}
}

export const clerkState = new ClerkState()

/**
 * Builds the Clerk singleton and starts loading it. Call once, from the root layout, in the
 * browser. Replaces `<ClerkProvider>`.
 */
export function initClerk(options: ClerkBootOptions) {
	clerkState.boot(options)
}

// -- auth --------------------------------------------------------------------------------------

// Stable across renders: React wrapped these in `useCallback` keyed on the clerk instance.
async function getToken(options?: GetTokenOptions): Promise<string | null> {
	await clerkState.whenSettled()
	const session = clerkState.instance?.session
	if (!session) return null
	return session.getToken(options)
}

const signOut = (async (...args: Parameters<SignOut>) => {
	await clerkState.whenSettled()
	return clerkState.instance!.signOut(...args)
}) as SignOut

const defaultDerivedInitialState = {
	actor: undefined,
	factorVerificationAge: null,
	orgId: undefined,
	orgPermissions: undefined,
	orgRole: undefined,
	orgSlug: undefined,
	sessionClaims: undefined,
	sessionId: undefined,
	sessionStatus: undefined,
	userId: undefined,
}

const authState = $derived.by<AuthState>(() => {
	// `useAuthBase`: before clerk-js has loaded there are no resources and every field is undefined.
	const resources = clerkState.resources
	const derived = resources
		? deriveState(true, resources, undefined)
		: (defaultDerivedInitialState as ReturnType<typeof deriveState>)
	const { userId, orgId, orgRole, orgPermissions, factorVerificationAge, sessionClaims } = derived
	const has = createCheckAuthorization({
		userId,
		orgId,
		orgRole,
		orgPermissions,
		factorVerificationAge,
		features: (sessionClaims as { fea?: string } | undefined | null)?.fea || '',
		plans: (sessionClaims as { pla?: string } | undefined | null)?.pla || '',
	})
	const payload = resolveAuthState({
		authObject: {
			sessionId: derived.sessionId,
			sessionStatus: derived.sessionStatus,
			userId,
			actor: derived.actor,
			orgId,
			orgRole,
			orgSlug: derived.orgSlug,
			sessionClaims,
			getToken,
			signOut,
			has,
		},
		// `useAuth()`'s default, which the app never overrode.
		options: { treatPendingAsSignedOut: true },
	})
	if (!payload) throw new Error('Clerk: invalid auth state')
	return payload as AuthState
})

const userState = $derived.by<UserState>(() => {
	// `useUser()`: `undefined` while loading, `null` signed out.
	const resources = clerkState.resources
	const user = resources ? resources.user : undefined
	if (user === undefined) return { isLoaded: false, isSignedIn: undefined, user: undefined }
	if (user === null) return { isLoaded: true, isSignedIn: false, user: null }
	return { isLoaded: true, isSignedIn: true, user }
})

const signInState = $derived.by<SignInState>(() => {
	const client = clerkState.resources?.client
	const instance = clerkState.instance
	if (!client || !instance) return { isLoaded: false, signIn: undefined, setActive: undefined }
	return {
		isLoaded: true,
		signIn: client.signIn,
		setActive: (params: SetActiveParams) => instance.setActive(params),
	}
})

/**
 * `useAuth()`. Read `.current` in a template, `$derived` or `$effect` to follow it. The object is
 * rebuilt only when Clerk emits new resources, and `getToken` / `signOut` on it never change identity.
 */
export function getAuth(): { readonly current: AuthState } {
	return {
		get current() {
			return authState
		},
	}
}

/** `useUser()` from `@clerk/react`: `{ isLoaded, isSignedIn, user }`. */
export function getUser(): { readonly current: UserState } {
	return {
		get current() {
			return userState
		},
	}
}

/** The legacy `useSignIn()` from `@clerk/react/legacy`: `{ isLoaded, signIn, setActive }`. */
export function getSignIn(): { readonly current: SignInState } {
	return {
		get current() {
			return signInState
		},
	}
}

/**
 * The subset of `useClerk()` the app uses. Methods that need a loaded instance wait for it, the
 * way `IsomorphicClerk` queued the call until clerk-js had loaded; `buildSignInUrl` returns `''`
 * before then, like `IsomorphicClerk`. Anything else: use `instance`, which is `null` until
 * {@link initClerk} has run.
 */
export interface ClerkFacade {
	readonly instance: Clerk | null
	/** Reactive. */
	readonly loaded: boolean
	/** Reactive. */
	readonly status: ClerkStatus
	/** Reactive. */
	readonly isSignedIn: boolean
	/** Reactive. `undefined` until loaded. */
	readonly client: Resources['client'] | undefined
	readonly session: Resources['session']
	readonly user: Resources['user']
	signOut: SignOut
	setActive(params: SetActiveParams): Promise<void>
	buildSignInUrl: Clerk['buildSignInUrl']
	/** Mounts Clerk's prebuilt OAuth consent UI. Requires `initClerk({ prefetchUI: true })`. */
	mountOAuthConsent(node: HTMLDivElement, props?: Parameters<Clerk['mountOAuthConsent']>[1]): void
	unmountOAuthConsent(node: HTMLDivElement): void
}

const facade: ClerkFacade = {
	get instance() {
		return clerkState.instance
	},
	get loaded() {
		return clerkState.loaded
	},
	get status() {
		return clerkState.status
	},
	get isSignedIn() {
		return clerkState.resources ? !!clerkState.resources.session : false
	},
	get client() {
		return clerkState.resources?.client
	},
	get session() {
		return clerkState.resources?.session
	},
	get user() {
		return clerkState.resources?.user
	},
	signOut,
	async setActive(params) {
		await clerkState.whenSettled()
		return clerkState.instance!.setActive(params)
	},
	buildSignInUrl(opts) {
		return clerkState.instance && clerkState.loaded ? clerkState.instance.buildSignInUrl(opts) : ''
	},
	mountOAuthConsent(node, props) {
		clerkState.instance!.mountOAuthConsent(node, props)
	},
	unmountOAuthConsent(node) {
		clerkState.instance?.unmountOAuthConsent(node)
	},
}

/** `useClerk()`. A single shared object; no need to call it during component initialisation. */
export function getClerk(): ClerkFacade {
	return facade
}
