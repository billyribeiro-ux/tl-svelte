<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentDeleted: { defaultMessage: 'This comment was deleted.' },
	})
</script>

<script lang="ts">
	import {
		createCommentingEnabled,
		createRevealThreadPending,
		getCommentRecord,
		getRevealThreadPending,
		revealThread,
	} from '@svelte-draw/commenting'
	import { untrack } from 'svelte'
	import { getEditor, getToasts, getTranslation } from 'svelte-draw'
	import { searchParams, setSearchParams } from '../../../../utils/router.svelte'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getIsReady } from '../../../hooks/useIsReady.svelte'

	/**
	 * dotcom's comment deep-link handler: `?comment=<thread or comment id>` (a shared link, or a
	 * notification row's navigation) becomes a reveal request served by the comments overlay, which
	 * owns waiting for the records to sync in and the cluster-aware reveal. Watches router state, so
	 * it fires on same-file navigations too, and strips the consumed param so back/refresh doesn't
	 * re-open the thread.
	 */
	const msg = getTranslation()
	const editor = getEditor()
	const app = getMaybeApp()
	const isReady = getIsReady()
	const commentingEnabled = createCommentingEnabled()
	const { addToast } = getToasts()
	const commentId = $derived(searchParams.get('comment'))
	const deletedMsg = $derived(msg(messages.commentDeleted))

	$effect(() => {
		if (!commentId) return
		revealThread(editor, commentId)
		untrack(() => {
			setSearchParams(
				(params) => {
					params.delete('comment')
					return params
				},
				{ replace: true }
			)
		})
	})

	// A request that stays unserved once the file is loaded, the overlay is serving (the license
	// gate has resolved), and the comment records are absent almost certainly points at a deleted
	// comment — explain the dead end instead of doing nothing, and mark the comment's notification
	// read so it doesn't keep dead-ending on every click. "Absent" is still a heuristic (the sync
	// layer has no records-settled signal), so the request is left pending: if the records are
	// merely late, the overlay still serves them when they land, and an unserved request is inert.
	const pendingRevealId = createRevealThreadPending()
	$effect(() => {
		const revealId = pendingRevealId.current
		const currentApp = app.current
		const title = deletedMsg
		if (!isReady.current || !commentingEnabled.current || !revealId) return
		const timer = setTimeout(() => {
			// Re-read rather than trusting the value we closed over: the request can clear inside the
			// grace period — the overlay unmounting drops it without the records ever arriving — and
			// this timer can still fire in the gap before the effect re-runs and cancels it.
			if (getRevealThreadPending(editor) !== revealId) return
			if (getCommentRecord(editor, revealId)) return
			addToast({ id: 'comment-deep-link-deleted', severity: 'info', title })
			if (currentApp?.getComments().some((c) => c.id === revealId)) {
				currentApp.markCommentRead(revealId)
			}
		}, 2000)
		return () => clearTimeout(timer)
	})
</script>
