<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { text }: { text: string } = $props()
</script>

<HTMLContainer style="background-color: #efefef">{text}</HTMLContainer>
