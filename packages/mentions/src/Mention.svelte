<script lang="ts">
	import type { MentionProps } from './types'

	/** An \@-mention pill for referencing a person. */
	let { name }: MentionProps = $props()
</script>

<span class="tlui-cmt-mention">@{name}</span>
