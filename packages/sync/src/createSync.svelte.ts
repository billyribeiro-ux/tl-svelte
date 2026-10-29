import { atom, transact } from '@svelte-draw/state'
import {
	ClientWebSocketAdapter,
	TLRemoteSyncError,
	TLSyncClient,
	TLSyncErrorCloseEventReason,
	type TLCustomMessageHandler,
	type TLObjectStoreAccess,
	type TLPersistentClientSocket,
	type TLPresenceMode,
	type TLSocketClientSentEvent,
	type TLSocketServerSentEvent,
} from '@svelte-draw/sync-core'
import {
	TAB_ID,
	UserRecordType,
	computed,
	createCachedUserResolve,
	createPresenceStateDerivation,
	createTLStore,
	createUserId,
	defaultUserPreferences,
	defaultUserStore,
	getDefaultUserPresence,
	getUserPreferences,
	registerColorsFromThemes,
	registerFontsFromThemes,
	resolveThemes,
	uniqueId,
	type Editor,
	type TLAssetStore,
	type TLPresenceStateInfo,
	type TLRecord,
	type TLStore,
	type TLStoreSchemaOptions,
	type TLStoreWithStatus,
	type TLThemes,
	type TLUser,
	type TLUserStore,
} from '@svelte-draw/editor'
import { createManagedTLSchemaFromUtils, stableValue } from '@svelte-draw/svelte'
import { areObjectsShallowEqual } from '@svelte-draw/utils'
import { untrack } from 'svelte'

const MULTIPLAYER_EVENT_NAME = 'multiplayer.client'

const defaultCustomMessageHandler: TLCustomMessageHandler = () => {}

// Keyed by `reason`, which is an arbitrary string off the server's close event, so a Map rather
// than an object literal: a reason of 'constructor' or '__proto__' would find a prototype member.
const SYNC_ERROR_EVENT_NAMES = new Map<string, string>([
	[TLSyncErrorCloseEventReason.NOT_FOUND, 'room-not-found'],
	[TLSyncErrorCloseEventReason.FORBIDDEN, 'forbidden'],
	[TLSyncErrorCloseEventReason.NOT_AUTHENTICATED, 'not-authenticated'],
	[TLSyncErrorCloseEventReason.RATE_LIMITED, 'rate-limited'],
])

type SyncSocket = TLPersistentClientSocket<
	TLSocketClientSentEvent<TLRecord>,
	TLSocketServerSentEvent<TLRecord>
>

// The socket reports 'error' but the collaboration status only knows 'offline'.
function toCollaborationStatus(status: SyncSocket['connectionStatus']) {
	return status === 'error' ? 'offline' : status
}

/**
 * A store wrapper specifically for remote collaboration that excludes local-only states.
 * This type represents a svelte-draw store that is synchronized with a remote multiplayer server.
 *
 * Unlike the base TLStoreWithStatus, this excludes 'synced-local' and 'not-synced' states
 * since remote stores are always either loading, connected to a server, or in an error state.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const sync = createSync(() => ({
 *     uri: 'wss://myserver.com/sync/room-123',
 *     assets: myAssetStore,
 *   }))
 * </script>
 *
 * {#if sync.current.status === 'loading'}
 *   <div>Connecting to multiplayer session...</div>
 * {:else if sync.current.status === 'error'}
 *   <div>Connection failed: {sync.current.error.message}</div>
 * {:else}
 *   <SvelteDrawEditor store={sync.current.store} />
 * {/if}
 * ```
 *
 * @public
 */
export type RemoteTLStoreWithStatus =
	| Exclude<
			TLStoreWithStatus,
			{ status: 'synced-local' } | { status: 'not-synced' } | { status: 'synced-remote' }
	  >
	| (Extract<TLStoreWithStatus, { status: 'synced-remote' }> & {
			/**
			 * Write access for object-store lane record types (e.g. comments), as granted by the
			 * server for this session. Independent of the canvas read-only state, so a session can
			 * be allowed to comment without being allowed to edit. Defaults to `'write'`.
			 */
			readonly objectAccess: TLObjectStoreAccess
	  })

/**
 * Creates a reactive store synchronized with a multiplayer server for real-time collaboration.
 *
 * This factory manages the complete lifecycle of a collaborative svelte-draw session, including
 * WebSocket connection establishment, state synchronization, user presence, and error handling.
 * The returned store can be passed directly to the SvelteDraw component to enable multiplayer features.
 *
 * The store progresses through multiple states:
 * - `loading`: Establishing connection and synchronizing initial state
 * - `synced-remote`: Successfully connected and actively synchronizing changes
 * - `error`: Connection failed or synchronization error occurred
 *
 * For optimal performance with media assets, provide an `assets` store that implements
 * external blob storage. Without this, large images and videos will be stored inline
 * as base64, causing performance issues during serialization.
 *
 * @param getOptions - Returns the configuration options for multiplayer synchronization
 *   - `uri` - WebSocket server URI (string or async function returning URI)
 *   - `assets` - Asset store for blob storage (required for production use)
 *   - `users` - User store for identity, presence and attribution
 *   - `getUserPresence` - Optional function to customize presence data
 *   - `onCustomMessageReceived` - Handler for custom socket messages
 *   - `roomId` - Room identifier for analytics (internal use)
 *   - `onMount` - Callback when editor mounts (internal use)
 *   - `trackAnalyticsEvent` - Analytics event tracker (internal use)
 *
 * @returns An object whose `current` is a reactive store wrapper with connection status and synchronized store
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Basic multiplayer setup
 *   const sync = createSync(() => ({
 *     uri: 'wss://myserver.com/sync/room-123',
 *     assets: myAssetStore,
 *     users: {
 *       currentUser: computed('current-user', () => ({
 *         id: createUserId('user-1'),
 *         name: 'Alice',
 *         color: '#ff0000',
 *         meta: {},
 *       })),
 *     },
 *   }))
 * </script>
 *
 * {#if sync.current.status === 'loading'}
 *   <div>Connecting to collaboration session...</div>
 * {:else if sync.current.status === 'error'}
 *   <div>Failed to connect: {sync.current.error.message}</div>
 * {:else}
 *   <SvelteDrawEditor store={sync.current.store} />
 * {/if}
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Dynamic authentication with user store
 *   const sync = createSync(() => ({
 *     uri: async () => {
 *       const token = await getAuthToken()
 *       return `wss://myserver.com/sync/room-123?token=${token}`
 *     },
 *     assets: authenticatedAssetStore,
 *     users: myUserStore,
 *     getUserPresence: (store, user) => {
 *       return {
 *         userId: user.id,
 *         userName: user.name,
 *         cursor: getCurrentCursor(store)
 *       }
 *     },
 *   }))
 * </script>
 * ```
 *
 * @public
 */
export function createSync(getOptions: () => UseSyncOptions & TLStoreSchemaOptions): {
	readonly current: RemoteTLStoreWithStatus
} {
	let state = $state.raw<{
		readyClient?: TLSyncClient<TLRecord, TLStore>
		error?: Error
		objectAccess?: TLObjectStoreAccess
	} | null>(null)

	// The options that, when they change identity, tear down and recreate the connection. This is
	// the dependency list of the former React effect. `getUserPresence` and
	// `onCustomMessageReceived` are deliberately absent: they are read through stable wrappers
	// below, so swapping them does not reconnect. The caller may pass a fresh options object every
	// time, so the comparison is on these fields only.
	const connectionOptions = stableValue(() => {
		const { uri, roomId = 'default', assets, users, onMount, connect, trackAnalyticsEvent } =
			getOptions()
		return { uri, roomId, assets, users, onMount, connect, track: trackAnalyticsEvent }
	}, areObjectsShallowEqual)

	// The schema is recreated only when the schema options change shallowly. Everything that is not
	// a schema option is stripped here.
	const schema = createManagedTLSchemaFromUtils(() => {
		const {
			uri: _uri,
			roomId: _roomId,
			assets: _assets,
			users: _users,
			onMount: _onMount,
			connect: _connect,
			trackAnalyticsEvent: _track,
			getUserPresence: _getUserPresence,
			onCustomMessageReceived: _onCustomMessageReceived,
			themes: _themes,
			...schemaOpts
		} = getOptions()

		// This line will throw a type error if we add any new options to the sync options but we don't destructure them
		// This is required because otherwise the schema might be recreated on every call if the newly-added option
		// is allowed to be unstable
		const __never__: never = 0 as any as keyof Omit<typeof schemaOpts, keyof TLStoreSchemaOptions>
		void __never__

		return schemaOpts
	})

	// Registered before the store is created: persisted data with custom theme colors and fonts
	// has to pass validation on load. `$effect.pre` runs before the connection effect below.
	$effect.pre(() => {
		const resolvedThemes = resolveThemes(getOptions().themes)
		registerColorsFromThemes(resolvedThemes)
		registerFontsFromThemes(resolvedThemes)
	})

	// Equivalent of `useReactiveEvent`: a stable function that reads the latest handler from an
	// atom, so a changed handler invalidates the presence derivation that calls it.
	const getUserPresenceAtom = atom<typeof getDefaultUserPresence>(
		'getUserPresence',
		(untrack(getOptions).getUserPresence ?? getDefaultUserPresence) as typeof getDefaultUserPresence
	)
	$effect.pre(() => {
		getUserPresenceAtom.set(
			(getOptions().getUserPresence ?? getDefaultUserPresence) as typeof getDefaultUserPresence
		)
	})
	const getUserPresence: typeof getDefaultUserPresence = (...args) =>
		getUserPresenceAtom.get()(...args)

	// Equivalent of `useEvent`: a stable function that always calls the latest handler.
	const onCustomMessageReceived: TLCustomMessageHandler = (...args) =>
		untrack(() =>
			(getOptions().onCustomMessageReceived ?? defaultCustomMessageHandler).call(null, ...args)
		)

	$effect(() => {
		const { uri, roomId, assets, users: _users, onMount, connect, track } = connectionOptions.current
		const currentSchema = schema.current

		return untrack(() => {
			const storeId = uniqueId()

			const currentUserSignal = _users?.currentUser ?? defaultUserStore.currentUser
			const users: Required<TLUserStore> = {
				currentUser: currentUserSignal,
				resolve:
					_users?.resolve ??
					createCachedUserResolve((userId) => {
						const id = createUserId(userId)
						const current = currentUserSignal.get()
						if (current && current.id === id) return current
						// Only the default user store falls back to presence records for other users.
						if (_users) return null
						const match = store.query
							.records('instance_presence')
							.get()
							.find((p) => p.userId === id)
						return match
							? UserRecordType.create({ id, name: match.userName, color: match.color })
							: null
					}),
			}

			// This always returns a non-null user for presence display, falling back
			// to anonymous user preferences. The store receives the raw `users` object
			// (where currentUser may return null), so attribution via
			// getAttributionUserId() correctly returns null for anonymous sessions.
			const currentUser = computed<TLUser>('currentUser', () => {
				const user = users.currentUser.get()
				if (user) return user
				const prefs = getUserPreferences()
				return UserRecordType.create({
					id: createUserId(prefs.id),
					name: prefs.name ?? '',
					color: prefs.color ?? defaultUserPreferences.color,
				})
			})

			let socket: SyncSocket
			if (connect) {
				if (uri) {
					throw new Error('uri and connect cannot be used together')
				}

				socket = connect({ sessionId: TAB_ID, storeId }) as SyncSocket
			} else if (uri) {
				socket = new ClientWebSocketAdapter(async () => {
					// set sessionId as a query param on the uri
					const withParams = new URL(typeof uri === 'string' ? uri : await uri())
					for (const param of ['sessionId', 'storeId']) {
						if (withParams.searchParams.has(param)) {
							throw new Error(
								`createSync. "${param}" is a reserved query param name. Please use a different name`
							)
						}
					}

					withParams.searchParams.set('sessionId', TAB_ID)
					withParams.searchParams.set('storeId', storeId)
					return withParams.toString()
				})
			} else {
				throw new Error('uri or connect must be provided')
			}

			let didCancel = false

			const collaborationStatusSignal = atom(
				'collaboration status',
				toCollaborationStatus(socket.connectionStatus)
			)
			const unsubscribeFromConnectionStatus = socket.onStatusChange(() => {
				collaborationStatusSignal.set(toCollaborationStatus(socket.connectionStatus))
			})

			const syncMode = atom('sync mode', 'readwrite' as 'readonly' | 'readwrite')

			const store = createTLStore({
				id: storeId,
				schema: currentSchema,
				assets,
				users,
				onMount,
				collaboration: {
					status: collaborationStatusSignal,
					mode: syncMode,
				},
			})

			const presence = createPresenceStateDerivation(currentUser, {
				getUserPresence,
			})(store)

			// Every connected session — each tab, window, or device — pushes its
			// presence on connect, so the store holds one instance_presence record per
			// *other* session in the room, including the user's own other tabs. (The
			// server never echoes a session its own record.) So an empty set means
			// we're genuinely the only session and can throttle to solo; any other
			// session — another user, or just another tab of our own — keeps us at the
			// full sync rate so edits propagate without the solo-mode lag.
			const otherSessions = store.query.ids('instance_presence')

			const presenceMode = computed<TLPresenceMode>('presenceMode', () => {
				return otherSessions.get().size === 0 ? 'solo' : 'full'
			})

			const client = new TLSyncClient<TLRecord, TLStore>({
				store,
				socket,
				didCancel: () => didCancel,
				onLoad(client) {
					track?.(MULTIPLAYER_EVENT_NAME, { name: 'load', roomId })
					// Keep objectAccess (onAfterConnect always runs first for this client) but drop the
					// rest: an `error` left behind by a previous client (e.g. NOT_FOUND on the old uri)
					// would otherwise keep reporting status 'error' for the new, healthy room.
					state = { readyClient: client, objectAccess: state?.objectAccess }
				},
				onSyncError(reason) {
					console.error('sync error', reason)

					track?.(MULTIPLAYER_EVENT_NAME, {
						name: SYNC_ERROR_EVENT_NAMES.get(reason) ?? 'sync-error:' + reason,
						roomId,
					})
					state = { error: new TLRemoteSyncError(reason) }
					socket.close()
				},
				onAfterConnect(_, { isReadonly, objectAccess }) {
					// Object-lane (comment) write access is decided per session by the server and can
					// change on reconnect (e.g. when the file's share tier changes), so surface it on
					// the returned status for consumers that gate comment UI. This fires before the
					// first onLoad, hence the merge in both directions.
					state = { ...state, objectAccess }
					transact(() => {
						syncMode.set(isReadonly ? 'readonly' : 'readwrite')
						// if the server crashes and loses all data it can return an empty document
						// when it comes back up. This is a safety check to make sure that if something like
						// that happens, it won't render the app broken and require a restart. The user will
						// most likely lose all their changes though since they'll have been working with pages
						// that won't exist. There's certainly something we can do to make this better.
						// but the likelihood of this happening is very low and maybe not worth caring about beyond this.
						store.ensureStoreIsUsable()
					})
				},
				onCustomMessageReceived,
				presence,
				presenceMode,
			})

			return () => {
				didCancel = true
				unsubscribeFromConnectionStatus()
				client.close()
				socket.close()
			}
		})
	})

	const result = $derived.by<RemoteTLStoreWithStatus>(() => {
		if (!state) return { status: 'loading' }
		if (state.error) return { status: 'error', error: state.error }
		if (!state.readyClient) return { status: 'loading' }
		return {
			status: 'synced-remote',
			connectionStatus: toCollaborationStatus(state.readyClient.socket.connectionStatus),
			store: state.readyClient.store,
			objectAccess: state.objectAccess ?? 'write',
		}
	})

	return {
		get current() {
			return result
		},
	}
}

/**
 * Configuration options for the {@link createSync} factory to establish multiplayer collaboration.
 *
 * This interface defines the required and optional settings for connecting to a multiplayer
 * server, managing user presence, handling assets, and customizing the collaboration experience.
 *
 * @example
 * ```ts
 * const syncOptions: UseSyncOptions = {
 *   uri: 'wss://myserver.com/sync/room-123',
 *   assets: myAssetStore,
 *   users: {
 *     currentUser: myCurrentUserSignal,
 *   },
 *   getUserPresence: (store, user) => ({
 *     userId: user.id,
 *     userName: user.name,
 *     cursor: getCursorPosition()
 *   })
 * }
 * ```
 *
 * @public
 */
export interface UseSyncOptionsBase {
	/**
	 * Named theme definitions. When provided, custom color names are automatically
	 * registered before the store is constructed so persisted data with those
	 * colors passes validation on load.
	 */
	themes?: Partial<TLThemes>

	/**
	 * Asset store implementation for handling file uploads and storage.
	 *
	 * Required for production applications to handle images, videos, and other
	 * media efficiently. Without an asset store, files are stored inline as
	 * base64, which causes performance issues with large files.
	 *
	 * The asset store must implement upload (for new files) and resolve
	 * (for displaying existing files) methods. For prototyping, you can use
	 * {@link @svelte-draw/editor#inlineBase64AssetStore} but this is not recommended for production.
	 *
	 * @example
	 * ```ts
	 * const myAssetStore: TLAssetStore = {
	 *   upload: async (asset, file) => {
	 *     const url = await uploadToCloudStorage(file)
	 *     return { src: url }
	 *   },
	 *   resolve: (asset, context) => {
	 *     return getOptimizedUrl(asset.src, context)
	 *   }
	 * }
	 * ```
	 */
	assets: TLAssetStore

	/**
	 * User store for identity, presence and attribution.
	 *
	 * Both methods return reactive {@link @svelte-draw/state#Signal | Signals}.
	 * `currentUser` provides the current user's identity (used for
	 * both presence broadcasting and shape attribution) and optionally
	 * `resolve(userId)` looks up other users by ID. If not provided,
	 * a default implementation backed by localStorage user preferences is
	 * used, with `resolve` falling back to presence records in the store.
	 */
	users?: TLUserStore

	/**
	 * Handler for receiving custom messages sent through the multiplayer connection.
	 *
	 * Use this to implement custom communication channels between clients beyond
	 * the standard shape and presence synchronization. Messages are sent using
	 * the TLSyncClient's sendMessage method.
	 *
	 * @param data - The custom message data received from another client
	 *
	 * @example
	 * ```ts
	 * onCustomMessageReceived: (data) => {
	 *   if (data.type === 'chat') {
	 *     displayChatMessage(data.message, data.userId)
	 *   }
	 * }
	 * ```
	 */
	onCustomMessageReceived?(data: any): void

	/** @internal */
	onMount?(editor: Editor): void
	/** @internal used for analytics only, we should refactor this away */
	roomId?: string
	/** @internal */
	trackAnalyticsEvent?(name: string, data: { [key: string]: any }): void

	/**
	 * A reactive function that returns a {@link @svelte-draw/tlschema#TLInstancePresence} object.
	 *
	 * This function is called reactively whenever the store state changes and
	 * determines what presence information to broadcast to other clients. The
	 * result is synchronized across all connected clients for displaying cursors,
	 * selections, and other collaborative indicators.
	 *
	 * If not provided, uses the default implementation which includes standard
	 * cursor position and selection state. Custom implementations allow you to
	 * add additional presence data like current tool, view state, or custom status.
	 *
	 * See {@link @svelte-draw/tlschema#getDefaultUserPresence} for
	 * the default implementation of this function.
	 *
	 * @param store - The current TLStore
	 * @param user - The current user information
	 * @returns Presence state to broadcast to other clients, or null to hide presence
	 *
	 * @example
	 * ```ts
	 * getUserPresence: (store, user) => {
	 *   return {
	 *     userId: user.id,
	 *     userName: user.name,
	 *     cursor: { x: 100, y: 200 },
	 *     currentTool: 'select',
	 *     isActive: true
	 *   }
	 * }
	 * ```
	 */
	getUserPresence?(store: TLStore, user: TLUser): TLPresenceStateInfo | null
}

/** @public */
export interface UseSyncOptionsWithUri extends UseSyncOptionsBase {
	/**
	 * The WebSocket URI of the multiplayer server for real-time synchronization.
	 *
	 * Must include the protocol (wss:// for secure, ws:// for local development).
	 * HTTP/HTTPS URLs will be automatically upgraded to WebSocket connections.
	 *
	 * Can be a static string or a function that returns a URI (useful for dynamic
	 * authentication tokens or room routing). The function is called on each
	 * connection attempt, allowing for token refresh and dynamic routing.
	 *
	 * Reserved query parameters `sessionId` and `storeId` are automatically added
	 * by the sync system and should not be included in your URI.
	 *
	 * @example
	 * ```ts
	 * // Static URI
	 * uri: 'wss://myserver.com/sync/room-123'
	 *
	 * // Dynamic URI with authentication
	 * uri: async () => {
	 *   const token = await getAuthToken()
	 *   return `wss://myserver.com/sync/room-123?token=${token}`
	 * }
	 * ```
	 */
	uri: string | (() => string | Promise<string>)
	connect?: never
}

/** @public */
export interface UseSyncOptionsWithConnectFn extends UseSyncOptionsBase {
	/**
	 * Create a connection to the server. Mostly you should use {@link UseSyncOptionsWithUri.uri}
	 * instead, but this is useful if you want to use a custom transport to connect to the server,
	 * instead of our default websocket-based transport.
	 */
	connect: UseSyncConnectFn
	uri?: never
}

/** @public */
export type UseSyncConnectFn = (query: {
	sessionId: string
	storeId: string
}) => TLPersistentClientSocket

/**
 * Options for {@link createSync}.
 * @public
 */
export type UseSyncOptions = UseSyncOptionsWithUri | UseSyncOptionsWithConnectFn
