<script lang="ts">
	import type { CommentBodyProps } from './comment-body'
	import { renderCommentHtml } from './comment-render'

	/**
	 * Renders a comment's rich-text body read-only through the limited comment extension set (no
	 * headings), so formatting (bold, links, lists, highlight) is preserved rather than flattened, and
	 * headings can never render. Use this as the `body` of a `CommentCard` on a canvas.
	 * @public
	 */
	let { richText, resolveName }: CommentBodyProps = $props()

	const html = $derived(renderCommentHtml(richText, resolveName))
</script>

<!-- The HTML is produced by TipTap's renderHTML over the comment schema (text and attribute values
     are escaped), never from raw user markup — the same trust the React `dangerouslySetInnerHTML`
     had. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div class="tlui-cmt-text">{@html html}</div>
