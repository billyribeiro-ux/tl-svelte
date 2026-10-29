<script lang="ts">
	import type { TLCursorProps } from '../context/components'
	import { getSharedSafeId } from './safeId'
	import { transform } from './transform'

	/**
	 * The default collaborator cursor: the arrow glyph plus a name tag or chat bubble. The arrow is a
	 * `<use>` of a shared `<defs>` symbol that `LiveCollaborators` renders, so a `DefaultCursor`
	 * used outside that layer draws no arrow.
	 */
	let { class: className, zoom, point, color, name, chatMessage }: TLCursorProps = $props()

	const cursorId = getSharedSafeId('cursor')
</script>

{#if point}
	<div class={['tl-collaborators__item', className]} {@attach transform(point.x, point.y, 1 / zoom)}>
		<svg class="tl-cursor" aria-hidden="true">
			<use href={`#${cursorId}`} {color} />
		</svg>
		{#if chatMessage}
			{#if name}
				<div class="tl-nametag-title" style:color>
					{name}
				</div>
			{/if}
			<div class="tl-nametag-chat" style:background-color={color}>
				{chatMessage}
			</div>
		{:else if name}
			<div class="tl-nametag" style:background-color={color}>
				{name}
			</div>
		{/if}
	</div>
{/if}
