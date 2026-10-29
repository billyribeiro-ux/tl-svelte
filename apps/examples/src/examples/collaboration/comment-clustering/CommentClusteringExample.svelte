<script lang="ts">
	import { commentToolOverrides, commentTools, putCommentRecords } from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		commentSchemaRecords,
		createComment,
		createCommentThread,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		toRichText,
		type Editor,
		type TLComponents,
		type VecLike,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import './comment-clustering.css'
	import CommentsLayer from './CommentsLayer.svelte'

	// [1]
	const THREADS: { point: VecLike; by: string; text: string }[] = [
		{ point: { x: 250, y: 140 }, by: 'ada', text: 'Should this column be wider?' },
		{ point: { x: 300, y: 170 }, by: 'grace', text: 'Agreed, it wraps on mobile.' },
		{ point: { x: 265, y: 220 }, by: 'ada', text: 'Same for the row beneath it.' },
		{ point: { x: 800, y: 250 }, by: 'grace', text: 'This label reads as a button.' },
		{ point: { x: 845, y: 285 }, by: 'ada', text: 'Let’s make it a link instead.' },
	]

	const store = createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) })

	const handleMount = (editor: Editor) => {
		const pageId = editor.getCurrentPageId()
		for (const { point, by, text } of THREADS) {
			const thread = createCommentThread({
				pageId,
				anchor: { type: 'point', x: point.x, y: point.y },
				createdBy: by,
			})
			const comment = createComment({
				threadId: thread.id,
				pageId,
				authorId: by,
				body: toRichText(text),
			})
			putCommentRecords(editor, [thread, comment])
		}
	}

	const components: TLComponents = { InFrontOfTheCanvas: CommentsLayer }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		licenseKey={getLicenseKey()}
		{store}
		tools={commentTools}
		overrides={[commentToolOverrides]}
		{components}
		onMount={handleMount}
	/>
	<div class="comment-clustering__hint">Zoom out to cluster (⌘/ctrl-scroll or pinch)</div>
</div>

<!--
[1]
Two clusters of pins, far enough apart that they stay separate while the ones within each group
merge. Zoom out and each group folds into a single count badge; zoom back in and they split apart.
Splits happen at a wider spacing than merges, so pins don't flicker at the threshold, and clicking a
badge zooms to just past the point where it splits.

Clustering is on by default and needs no configuration. Turn it off with
`CommentTool.configure({ enableClustering: false })` and every pin renders individually at every
zoom.
-->
