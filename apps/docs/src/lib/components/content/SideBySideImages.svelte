<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import Image from './Image.svelte'

	let { left, right }: { left: ComponentProps<typeof Image>; right: ComponentProps<typeof Image> } =
		$props()
</script>

<span class="flex gap-8 sm:gap-2 flex-col sm:flex-row">
	<Image {...left} />
	<Image {...right} />
</span>
