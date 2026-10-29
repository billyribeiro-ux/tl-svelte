<script lang="ts">
	import { getFirstCharacter } from '@svelte-draw/utils'
	import type { AvatarProps } from './types'

	/** A person's avatar — their image if provided, otherwise a single-initial coloured circle. */
	let { author }: AvatarProps = $props()

	const initial = $derived((getFirstCharacter(author.name.trim()) || '?').toUpperCase())
</script>

{#if author.image}
	<img
		class="tlui-cmt-avatar tlui-cmt-avatar--image"
		src={author.image}
		alt=""
		width="28"
		height="28"
		aria-hidden="true"
	/>
{:else}
	<div
		class="tlui-cmt-avatar"
		aria-hidden="true"
		style:background-color={author.color ? author.color : undefined}
	>
		{initial}
	</div>
{/if}
