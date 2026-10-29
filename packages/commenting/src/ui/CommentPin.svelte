<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface CommentPinProps {
		/** What the pin shows when unresolved — a number, an author initial, an <Avatar>, etc.
		 *  Left as a lever so consumers aren't locked into a count. */
		children?: Snippet
		resolved?: boolean
		/** The pin's thread is open — shows the active/selected indicator state. */
		open?: boolean
	}
</script>

<script lang="ts">
	import PinCheckIcon from './icons/PinCheckIcon.svelte'

	/** A canvas comment marker: shows its `children` (or a check when resolved). Purely
	 * presentational — it reflects open/resolved state via CSS; wrap it to make it clickable.
	 * @public */
	let { children, resolved, open }: CommentPinProps = $props()
</script>

<!-- `tlui-cmt-marker` carries the resting shadow and the hover lift — the same treatment a
     count badge wears, so the two markers behave alike. -->
<div
	class={[
		'tlui-cmt-marker',
		'tlui-cmt-pin',
		resolved && 'tlui-cmt-pin--resolved',
		open && 'tlui-cmt-marker--open',
	]}
>
	{#if resolved}
		<!-- Decorative — the pin's accessible name lives on whatever wraps it. -->
		<PinCheckIcon />
	{:else}
		{@render children?.()}
	{/if}
</div>
