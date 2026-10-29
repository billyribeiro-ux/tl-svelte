<script lang="ts">
	import type { TLNoteShapeAttributionProps } from 'svelte-draw'

	let { firstName, color }: TLNoteShapeAttributionProps = $props()
</script>

<div
	class="tl-note__attribution"
	style:font-size="11px"
	style:font-weight="600"
	style:color
	style:display="flex"
	style:align-items="center"
	style:gap="2px"
>
	<span aria-hidden="true">✍️</span>
	{firstName}
</div>
