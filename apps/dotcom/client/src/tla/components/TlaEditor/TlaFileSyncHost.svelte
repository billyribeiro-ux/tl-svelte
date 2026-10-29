<script lang="ts" module>
	import type { RemoteTLStoreWithStatus } from '@svelte-draw/sync'
	import { getContext, setContext } from 'svelte'
	import { assertExists } from 'svelte-draw'
	import type { FileLoad } from '../../../utils/fileLoad'

	export interface FileSyncStoreHolder {
		readonly current: RemoteTLStoreWithStatus
	}

	const FILE_SYNC_STORE_KEY = Symbol('dotcom.fileSyncStore')
	const FILE_LOAD_KEY = Symbol('dotcom.fileLoad')

	/** Was `useFileSyncStore()`. Must be called under a `<TlaFileSyncHost>`. */
	export function getFileSyncStore(): FileSyncStoreHolder {
		return assertExists(
			getContext<FileSyncStoreHolder | undefined>(FILE_SYNC_STORE_KEY),
			'TlaFileSyncHost is missing above'
		)
	}

	/** Was `useFileLoad()`. This file open's file_load tracker, begun where the open begins: the sync host. */
	export function getFileLoad(): FileLoad {
		return assertExists(
			getContext<FileLoad | undefined>(FILE_LOAD_KEY),
			'TlaFileSyncHost is missing above'
		)
	}

	/** Location state key for the `/` redirect from the local cache; holds a `startCachedFileVisit` token. */
	export const VIA_LAST_FILE_CACHE = 'viaLastFileCache'
</script>

<script lang="ts">
	import type { TLCustomServerEvent } from '@svelte-draw/dotcom-shared'
	import { createSync } from '@svelte-draw/sync'
	import { untrack, type Snippet } from 'svelte'
	import {
		commentSchemaRecords,
		computed,
		createUserId,
		fromComputed,
		getUserPreferences,
		omit,
		UserRecordType,
		type TLUserStore,
	} from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { trackEvent } from '../../../utils/analytics'
	import { CLIENT_BUILD_TIMESTAMP, MULTIPLAYER_SERVER } from '../../../utils/config'
	import { fileLoads } from '../../../utils/fileLoad'
	import { markFirstLoad } from '../../../utils/firstLoad'
	import { multiplayerAssetStore } from '../../../utils/multiplayerAssetStore'
	import { location, navigate } from '../../../utils/router.svelte'
	import { currentApp$, getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawCurrentUser } from '../../hooks/useUser.svelte'
	import {
		endCachedFileVisit,
		isCachedFileVisitLive,
		resolveCachedFileVisit,
	} from '../../utils/cachedFileVisit'
	import { clearLastVisitedFile, setLastVisitedFile } from '../../utils/local-session-state'

	function createPresenceUserStore(userId: string | undefined): TLUserStore {
		// Signed out, attribute nothing: the sync default store would stamp the local preferences id,
		// which authorizeFileRecord rejects for a guest session, rolling back note edits and duplicates.
		if (!userId) return { currentUser: computed('currentUser', () => null) }
		return {
			currentUser: computed('currentUser', () => {
				// The socket opens before Zero has the user row. The id must be right from the first
				// frame (the server authorizes records against it); name and color may catch up later.
				const prefs = currentApp$.get()?.tlUser.userPreferences.get() ?? getUserPreferences()
				return UserRecordType.create({
					id: createUserId(userId),
					name: prefs.name ?? '',
					color: prefs.color ?? '',
				})
			}),
		}
	}

	/**
	 * Owns the file room's sync store so it can connect while the signed-in app is still preloading
	 * from Zero: the uri only needs the slug, the build timestamp and a Clerk token. Everything that
	 * needs the app (the editor, session restore, slurping) mounts below, once it exists.
	 */
	let { fileSlug, children }: { fileSlug: string; children: Snippet } = $props()

	// Once per mount; begin() maps a same-file remount of an unfinished open back to its load.
	const fileLoad = untrack(() => fileLoads.begin(fileSlug))
	fileLoad.mark('file-started')
	const user = getSvelteDrawCurrentUser()
	const userId = $derived(user.current?.id)
	// Reads the latest user, so it keeps its identity (and the connection its options) across user changes.
	async function getUserToken() {
		return (await user.current?.getToken()) ?? 'not-logged-in'
	}

	// The sync options below are compared by identity to decide whether to reconnect, so each one
	// is derived from the inputs that really should reconnect it, and from nothing else.
	const assets = $derived.by(() => {
		const slug = fileSlug
		return multiplayerAssetStore({ getFileId: () => slug, getToken: getUserToken })
	})
	const users = $derived(createPresenceUserStore(userId))
	const uri = $derived.by(() => {
		const slug = fileSlug
		const uid = userId
		return async () => {
			const url = new URL(`${MULTIPLAYER_SERVER}/app/file/${slug}`)
			url.searchParams.set('v', CLIENT_BUILD_TIMESTAMP)
			// Only connects before sync-connected belong to the load; a later reconnect carrying an id
			// would make the server park and send an echo nobody reads.
			const connectId = fileLoad.nextConnectId()
			if (connectId) url.searchParams.set('loadId', connectId)
			if (uid) {
				url.searchParams.set('accessToken', await getUserToken())
				markFirstLoad('sync-token-fetched')
				fileLoad.mark('sync-token-fetched')
			}
			return url.toString()
		}
	})

	function onCustomMessageReceived(message: TLCustomServerEvent) {
		if (message.type === 'first_load_server') {
			fileLoad.setServerTimings(message)
			return
		}
		trackEvent(message.type)
	}

	// `load` fires right after the snapshot is applied. An effect on `synced-remote` would wait out
	// the editor's mount work, seconds on big boards.
	function trackAnalyticsEvent(_name: string, data: { name?: string }) {
		if (data.name !== 'load') return
		markFirstLoad('sync-connected')
		fileLoad.mark('sync-connected')
	}

	const store = createSync(() => ({
		uri,
		assets,
		users,
		// Register the opt-in `comment` record type so comment records sync through the file room.
		// Must match the server schema (see fileSyncSchema in TLFileDurableObject).
		records: commentSchemaRecords,
		onCustomMessageReceived,
		trackAnalyticsEvent,
	}))

	setContext(FILE_LOAD_KEY, fileLoad)
	setContext(FILE_SYNC_STORE_KEY, store)

	const viaCache = $derived(isCachedFileVisitLive(location.state?.[VIA_LAST_FILE_CACHE]))
	$effect(() => {
		if (!viaCache) endCachedFileVisit()
	})
	const app = getMaybeApp()
	// Only while the flag is set: getMostRecentFileId reads every file_state, so an ungated read
	// would re-run on each throttled lastVisitAt write for the whole session. The Svelte inputs are
	// captured outside the computed, which does not track Svelte state.
	const zero = $derived.by(() => {
		const cached = viaCache
		const slug = fileSlug
		return fromComputed('zero facts for the cached visit', () => {
			const currentApp = app.current
			return cached && currentApp
				? {
						hasFileState: currentApp.isFileVisitable(slug),
						mostRecentFileId: currentApp.getMostRecentFileId(),
					}
				: null
		})
	})
	const visit = $derived.by(() => {
		if (!viaCache) return null
		const current = store.current
		const facts = zero.current
		return resolveCachedFileVisit({
			status: current.status,
			error: current.status === 'error' ? current.error : undefined,
			appLoaded: !!facts,
			hasFileState: facts?.hasFileState ?? false,
			mostRecentFileId: facts?.mostRecentFileId ?? null,
			fileId: fileSlug,
		})
	})
	// Primitives, so the effects below do not re-run on every change until the navigation commits.
	const visitKind = $derived(visit?.kind ?? null)
	const redirectFileId = $derived(visit?.kind === 'redirect' ? visit.fileId : null)
	// Leaving must not hand the store to the editor (an errored one would throw into the route
	// error page), nor let a late sync write this file into the cache.
	const leaving = $derived(visitKind === 'fallback' || visitKind === 'redirect')

	$effect(() => {
		if (store.current.status !== 'synced-remote') return
		const uid = userId
		const slug = fileSlug
		// Written only once the room accepted us, so the cache never points at a file this account
		// cannot open.
		if (uid && !leaving) setLastVisitedFile(uid, slug)
	})

	$effect(() => {
		const kind = visitKind
		const redirectId = redirectFileId
		const pathname = location.pathname
		const search = location.search
		const hash = location.hash
		const state = location.state
		untrack(() => {
			// The hit rate of the cached redirect: a miss costs a wasted room boot on top of main's path.
			if (kind && kind !== 'pending') {
				trackEvent('cached-file-visit', { outcome: kind })
				fileLoads.noteCachedVisit(kind)
			}
			switch (kind) {
				case 'fallback':
					clearLastVisitedFile()
					navigate(routes.tlaRoot(), { replace: true })
					return
				case 'redirect':
					navigate(routes.tlaFile(redirectId!), {
						replace: true,
						state: omit(state, [VIA_LAST_FILE_CACHE]),
					})
					return
				case 'accepted':
					// Drop the flag from history state so a later reload is an ordinary visit. Keep the
					// search: `?d=` is read at mount.
					navigate(`${pathname}${search}${hash}`, {
						replace: true,
						state: omit(state, [VIA_LAST_FILE_CACHE]),
					})
					return
			}
		})
	})
</script>

{#if !leaving}
	{@render children()}
{/if}
