<script lang="ts">
	import { commentToolOverrides, commentTools, putCommentRecords } from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		commentSchemaRecords,
		createComment,
		createCommentThread,
		createShapeId,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		toRichText,
		type Editor,
		type TLComponents,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import './comment-notifications.css'
	import CommentsLayer from './CommentsLayer.svelte'
	import NotificationsPanel from './NotificationsPanel.svelte'
	import { bodyMentioning, ME, MINUTE } from './notifications'

	function handleMount(editor: Editor) {
		const boxId = createShapeId()
		editor.run(
			() => {
				editor.createShapes([
					{
						id: boxId,
						type: 'geo',
						x: 180,
						y: 140,
						props: { geo: 'rectangle', w: 260, h: 160, richText: toRichText('Hero image') },
					},
				])
			},
			{ history: 'ignore' }
		)

		const pageId = editor.getCurrentPageId()
		const now = Date.now()

		// A thread you started, with a reply from Ada — a `reply` notification.
		const yourThread = createCommentThread({
			pageId,
			anchor: { type: 'point', x: 540, y: 200 },
			createdBy: ME,
			now: now - 90 * MINUTE,
		})
		// A thread Ada started on the shape, mentioning you — a `mention` notification.
		const adaThread = createCommentThread({
			pageId,
			anchor: { type: 'shape', shapeId: boxId, x: 0.5, y: 0.5, isPrecise: true },
			createdBy: 'ada',
			now: now - 20 * MINUTE,
		})

		putCommentRecords(editor, [
			yourThread,
			adaThread,
			createComment({
				threadId: yourThread.id,
				pageId,
				authorId: ME,
				body: toRichText('Should this sit above the fold?'),
				now: now - 90 * MINUTE,
			}),
			createComment({
				threadId: yourThread.id,
				pageId,
				authorId: 'ada',
				body: toRichText('Yes — it reads as an afterthought where it is now.'),
				now: now - 45 * MINUTE,
			}),
			createComment({
				threadId: adaThread.id,
				pageId,
				authorId: 'ada',
				body: bodyMentioning('', ME, ' can you swap in the final crop?'),
				now: now - 20 * MINUTE,
			}),
		])

		// Padded well to the left of the content, so the fitted view leaves the strip under the inbox
		// panel empty and both seeded pins land in the clear.
		editor.zoomToBounds({ x: -160, y: 80, w: 900, h: 400 }, { immediate: true })
	}

	const components: TLComponents = {
		InFrontOfTheCanvas: CommentsLayer,
	}

	const store = createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) })
</script>

<div class="svelte-draw__editor">
	<!-- Commenting is a licensed feature. Every feature is enabled in local development, but a
		deployed app needs a license key that includes commenting — swap in your own key here. -->
	<SvelteDraw
		licenseKey={getLicenseKey()}
		{store}
		onMount={handleMount}
		tools={commentTools}
		overrides={[commentToolOverrides]}
		{components}
	>
		<NotificationsPanel />
	</SvelteDraw>
</div>

<!--
[1]
Read receipts are the host's data, not the SDK's. A comment record says who wrote it and when; who
has *seen* it is one row per (comment, reader), which a real app keeps in its own database so the
count survives a reload and follows you between devices.

Here that store is a local atom, so the whole flow runs in memory. An atom rather than component state
because the two callbacks below are handed to `CanvasComments` once: keeping them stable avoids
re-creating the comments layer every time something is read, and `fromSignal` gives the panel its
reactive read of the same set.

[2]
An `@`-mention is a `{ type: 'mention', attrs: { id } }` node inside the comment's rich-text body,
where `attrs.id` is the member id the composer's picker chose. Walking the body for those ids is
how "this comment mentions me" is decided — the notification reason with the strongest claim on
someone's attention.

[3]
Why a comment is worth telling someone about is a product decision, so the SDK doesn't make it.
This example uses the two reasons that need no server: the comment mentions you, or it lands in a
thread you're part of. A hosted app usually adds more — activity on a board you own, say — and
resolves them server-side so the feed spans every board rather than the one that's open.

[4]
The feed is derived, not stored: `getLiveComments` and `getLiveCommentThreads` give the comment records
reactively, and each one is tagged with a reason and checked against the read set. Nothing needs to
be written when a comment arrives.

Read comments stay in the list — the unread dot and the header badge are what clear. Filtering the
list down to unread only would make the feed lose its history the moment you read it.

[5]
Comments are ordinary records, so "someone else commented" is just a write. This stands in for the
sync connection a real app would have; opening this example in two tabs against a synced store
would show the same thing arriving on its own.

[6]
`revealThread` is the jump-to-thread entry point for anything outside the canvas — this feed, a
deep link, an email. It's forgiving about timing: `CanvasComments` waits for the records to sync
in, switches pages, unhides pins, and zooms far enough to split the thread out of any cluster
before opening it. It takes a thread id or, as here, the id of any comment in it.

Opening the thread is also what marks it read: the thread view reports every unread comment it
displays through `onCommentsRead`, batched per report, including replies that arrive while it stays
open.
-->
