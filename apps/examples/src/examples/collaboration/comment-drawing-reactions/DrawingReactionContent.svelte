<script lang="ts">
	import { atom, fromComputed, getEditor, type TLRecord } from 'svelte-draw'
	import { untrack } from 'svelte'
	import { isDrawingReactionToken, type ReactionDrawingRecord } from './drawingReactions'

	/**
	 * Draws a reaction token, for the `ReactionContent` slot of the commenting options:
	 * `CommentTool.configure({ components: { ReactionContent: DrawingReactionContent } })`.
	 *
	 * A drawing token is resolved through the store — the token is a `reaction-drawing` record id,
	 * and the record holds the image. Any other token falls through to the token string (the default
	 * behaviour, i.e. an emoji glyph drawn by the OS emoji font). A drawing token whose record isn't
	 * in the store renders as nothing: over sync, a reaction can arrive before its drawing, and a
	 * token is only ever a claim — the renderer can't assume it names a real record.
	 *
	 * The image is rendered via `<img>`, never inlined — an `<img>`-hosted SVG can't run script or
	 * reach out to the network, which matters because drawings arrive from other users over sync.
	 * Resolution reads the editor from context, so this only renders inside the host editor's tree
	 * (everywhere the commenting UI puts it).
	 */
	let { token }: { token: string } = $props()

	const editor = getEditor()
	// The prop is Svelte state, which a signal computation cannot track, so it is mirrored into an atom.
	const tokenAtom = atom('reaction token', untrack(() => token))
	$effect.pre(() => {
		tokenAtom.set(token)
	})
	const src = fromComputed('reaction drawing src', () => {
		const current = tokenAtom.get()
		if (!isDrawingReactionToken(current)) return null
		const record = editor.store.get(current as TLRecord['id']) as unknown as
			| ReactionDrawingRecord
			| undefined
		return record?.src ?? null
	})
</script>

{#if !isDrawingReactionToken(token)}
	{token}
{:else if src.current}
	<!-- A fixed size rather than `em`: the reaction pill's font is 10px, and a drawing at emoji scale
		is an illegible smudge. Only drawn reactions render through this style, so emoji keep their
		hosts' font size; a pill holding a drawing grows taller than its emoji neighbours, which is
		the point — you drew it to be seen. -->
	<img
		src={src.current}
		alt=""
		width="22"
		height="22"
		draggable="false"
		style="width: 22px; height: 22px; object-fit: contain; display: inline-block; vertical-align: middle;"
	/>
{/if}
