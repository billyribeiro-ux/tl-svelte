<script lang="ts">
	import Embed from './Embed.svelte'

	let { id }: { id: string } = $props()
</script>

<Embed
	src="https://{id}.templates.svelte-draw.invalid/?utm_source=docs-embed"
	tryButton="Try starter kit"
/>
