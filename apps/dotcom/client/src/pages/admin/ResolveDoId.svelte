<script lang="ts" module>
	interface ResolvedDoRoom {
		slug: string
		isApp: boolean
		deleted: boolean
		connectedSockets: number
		roomLoaded: boolean
		bootStage: string | null
		bootStageAgeMs: number | null
	}

	interface ResolvedDoHistory {
		saves: number
		firstSaveAt: string | null
		lastSaveAt: string | null
		avgSecondsBetweenSaves: number | null
		latestSizeBytes: number | null
		totalSizeBytes: number
		listTruncated: boolean
	}

	function formatAgo(iso: string) {
		const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
		if (seconds < 120) return `${seconds}s ago`
		if (seconds < 7200) return `${Math.round(seconds / 60)}m ago`
		if (seconds < 172800) return `${Math.round(seconds / 3600)}h ago`
		return `${Math.round(seconds / 86400)}d ago`
	}

	function formatInterval(seconds: number) {
		if (seconds < 120) return `${seconds}s`
		if (seconds < 7200) return `${Math.round(seconds / 60)}m`
		return `${(seconds / 3600).toFixed(1)}h`
	}

	/** The question this section exists to answer: is anyone actually using this room? */
	function activityVerdict(match: ResolvedDoRoom, history: ResolvedDoHistory) {
		const lastSaveAgeMs = history.lastSaveAt
			? Date.now() - new Date(history.lastSaveAt).getTime()
			: Infinity
		if (match.connectedSockets === 0) {
			return 'idle — no tabs connected'
		}
		if (lastSaveAgeMs < 60 * 60 * 1000) {
			return 'actively edited — connected and saving'
		}
		return 'parked tab(s) — connected but not editing'
	}

	// Cloudflare dash coordinates for the production TLDR_DOC namespace, for metrics deep links only
	const CF_ACCOUNT_TAG = 'c34edc4e76350954b63adebde86d5eb1'
	const CF_TLDR_DOC_NAMESPACE_ID = '5864db4344ac4c55bfd94e81dd25a043'
</script>

<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { formatBytes, getResponseError } from './shared.svelte'

	/**
	 * Looks up a room by durable object id (from Cloudflare analytics or the dash) or by room slug,
	 * with liveness and persist-history signals. The server distinguishes the two forms and returns
	 * the canonical object id either way.
	 */
	let input = $state('')
	let isRunning = $state(false)
	let error = $state<string | null>(null)
	let copied = $state(false)
	let result = $state.raw<{
		objectId: string
		match: ResolvedDoRoom | null
		history: ResolvedDoHistory | null
	} | null>(null)

	async function resolve(idOrSlug: string) {
		error = null
		result = null
		copied = false
		isRunning = true
		try {
			// the server resolves either form and returns the canonical object id
			const res = await fetch(`/api/app/admin/resolve-do-id/${encodeURIComponent(idOrSlug)}`)
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			result = await res.json()
		} catch (err) {
			error = err instanceof Error ? err.message : 'Resolve failed'
		} finally {
			isRunning = false
		}
	}

	async function onResolve() {
		const idOrSlug = input.trim()
		// hex is a subset of the slug charset — catch truncated/uppercase ids before they hash as slugs
		if (/^[0-9a-fA-F]{16,}$/.test(idOrSlug) && !/^[0-9a-f]{64}$/.test(idOrSlug)) {
			error =
				'Looks like a truncated or uppercase durable object id — paste the full 64-char lowercase hex'
			return
		}
		if (!/^[0-9a-f]{64}$/.test(idOrSlug) && !/^[a-zA-Z0-9_-]+$/.test(idOrSlug)) {
			error = 'Paste a 64-character hex durable object id or a room slug'
			return
		}
		await resolve(idOrSlug)
	}

	async function onCopySlug(slug: string) {
		await navigator.clipboard.writeText(slug)
		copied = true
		setTimeout(() => {
			copied = false
		}, 1500)
	}

	const match = $derived(result?.match)
	const history = $derived(result?.history)

	let isClosing = $state(false)
	async function onForceClose() {
		// target the id that was resolved, not the live input — the admin may have edited the
		// input since, and the button describes the resolved room
		if (!result || !match) return
		if (
			!window.confirm(
				`Force-close ${match.connectedSockets} session(s) on ${match.slug}? ` +
					'Every connected tab (including anyone actively editing) is disconnected and shown ' +
					'a "please reload" screen.'
			)
		) {
			return
		}
		error = null
		isClosing = true
		try {
			const res = await fetch(`/api/app/admin/close-do-sessions/${result.objectId}`, {
				method: 'POST',
			})
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			// re-resolve the same object so the socket count and verdict reflect the drain
			await resolve(result.objectId)
		} catch (err) {
			error = err instanceof Error ? err.message : 'Force-close failed'
		} finally {
			isClosing = false
		}
	}
</script>

<div>
	<p>
		Paste a durable object id (full 64-character hex — dash lists truncate, grab the full id from
		the search dropdown or GraphQL) or a room slug — either resolves to the room&apos;s activity.
		<b>Sockets</b> are live tabs; save stats come from the snapshot history bucket. Frequent recent
		saves = someone editing; sockets with stale saves = parked background tabs; no sockets = idle.
		The slug is copyable instead of linked — we do not open users&apos; files.
	</p>
	<div class={styles.searchContainer}>
		<input
			class={styles.searchInput}
			placeholder="Durable object id (64-char hex) or room slug"
			bind:value={input}
			onkeydown={(e) => e.key === 'Enter' && onResolve()}
			disabled={isRunning}
		/>
		<AdminButton variant="primary" onclick={onResolve} isLoading={isRunning}>Resolve</AdminButton>
	</div>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if result && !match}
		<div class={styles.subTitle}>No room for that id or slug (never initialized)</div>
	{/if}
	{#if match && result}
		<div class={styles.subTitle}>
			<div>
				<!-- deliberately not a file link — we don't open users' files, we copy the slug -->
				<code>{match.slug}</code>{' '}
				<AdminButton onclick={() => onCopySlug(match.slug)}>
					{copied ? 'Copied' : 'Copy slug'}
				</AdminButton>{' '}
				<a
					href={`https://dash.cloudflare.com/${CF_ACCOUNT_TAG}/workers/durable-objects/view/${CF_TLDR_DOC_NAMESPACE_ID}?id=${result.objectId}&name=${encodeURIComponent(`/r/${match.slug}`)}`}
					target="_blank"
					rel="noreferrer"
				>
					metrics ↗
				</a>{' '}
				— {match.isApp ? 'app file' : 'legacy room'}
				{match.deleted ? ' (deleted)' : ''}
			</div>
			<div>
				{#if history}<b>{activityVerdict(match, history)}</b>{/if} · {match.connectedSockets}{' '}
				socket{match.connectedSockets === 1 ? '' : 's'} connected · room{' '}
				{match.bootStage !== null
					? `booting: ${match.bootStage} for ${Math.round((match.bootStageAgeMs ?? 0) / 1000)}s`
					: match.roomLoaded
						? 'loaded in memory'
						: 'not loaded (hibernated or idle)'}
			</div>
			{#if history}
				<div>
					{history.saves === 0
						? 'No snapshots in the history bucket (retention window)'
						: `${history.saves.toLocaleString()}${history.listTruncated ? '+' : ''} saves · ` +
							`last ${history.lastSaveAt ? formatAgo(history.lastSaveAt) : '-'} · ` +
							`first ${history.firstSaveAt ? formatAgo(history.firstSaveAt) : '-'} · ` +
							(history.avgSecondsBetweenSaves !== null
								? `every ~${formatInterval(history.avgSecondsBetweenSaves)} · `
								: '') +
							`latest ${history.latestSizeBytes !== null ? formatBytes(history.latestSizeBytes) : '-'} · ` +
							`total ${formatBytes(history.totalSizeBytes)}`}
				</div>
			{/if}
			{#if match.connectedSockets > 0}
				<div>
					<AdminButton variant="danger" onclick={onForceClose} isLoading={isClosing}>
						Force-close {match.connectedSockets} session{match.connectedSockets === 1 ? '' : 's'}
					</AdminButton>
				</div>
			{/if}
		</div>
	{/if}
</div>
