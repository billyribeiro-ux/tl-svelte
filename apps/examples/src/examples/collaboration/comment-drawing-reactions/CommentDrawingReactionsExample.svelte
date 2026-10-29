<script lang="ts">
	import {
		CommentTool,
		commentToolOverrides,
		isAllowedReactionEmoji,
	} from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		commentSchemaRecords,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		type TLComponents,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import './comment-drawing-reactions.css'
	import CommentsLayer from './CommentsLayer.svelte'
	import DrawingReactionContent from './DrawingReactionContent.svelte'
	import { isDrawingReactionToken, reactionDrawingRecords } from './drawingReactions'
	import ReactionPalette from './ReactionPalette.svelte'

	// [1] (ReactionPalette.svelte) [2]
	const COMMENT_TOOLS = [
		CommentTool.configure({
			components: {
				ReactionPalette,
				ReactionContent: DrawingReactionContent,
			},
			isAllowedReaction: (token) => isDrawingReactionToken(token) || isAllowedReactionEmoji(token),
		}),
	]

	const store = createTLStore({
		// [3]
		schema: createTLSchema({
			records: { ...commentSchemaRecords, ...reactionDrawingRecords },
		}),
	})

	const components: TLComponents = { InFrontOfTheCanvas: CommentsLayer }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		licenseKey={getLicenseKey()}
		{store}
		tools={COMMENT_TOOLS}
		overrides={[commentToolOverrides]}
		{components}
	/>
</div>

<!--
A reaction token is a free-form string, capped at 64 characters because it is embedded in the
reaction's record id. So a custom reaction can be anything, as long as the token *names* the content
rather than contains it. `drawingReactions.ts` implements that recipe: a `reaction-drawing` record
holds the image, the palette saves one and emits its id, and the renderer resolves the id back to
the image. The same shape works for stickers or sounds — for heavyweight content, have the record
hold an uploaded asset's URL instead of inline bytes, since document records replicate to every
client on the file.

[1]
`DrawingReactionPalette` renders a nested `<SvelteDraw>`, which is a second editor and wants its own
license key. The wrapper also binds `saveDrawing` to the host editor (this component renders in
the host's UI, so `getEditor()` is the host), which is how a submitted drawing lands in the host
document rather than the palette's scratch canvas.

[2]
The pieces are configured together on the comment tool, and they have to agree: the palette emits
record-id tokens, `ReactionContent` resolves and draws them, and `isAllowedReaction` lets them
through. Emoji stay allowed alongside drawings, so both kinds coexist on the same comment.
`isAllowedReaction` can only check a token's shape — a token is a claim, not proof the record
exists — so the renderer treats a missing record as "render nothing".

[3]
The drawing record type registers next to the commenting records. With multiplayer sync, register
it on the server's schema too, or validation fails on connect. The record's own validator enforces
the data:image allowlist and a size cap, so those limits hold against any writer, not just this
palette. Drawings are never garbage-collected here; a real app might sweep records no reaction
references.
-->
