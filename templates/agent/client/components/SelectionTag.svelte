<script lang="ts">
	import PromptTag from './PromptTag.svelte'

	let { onClick }: { onClick?: () => void } = $props()
</script>

<PromptTag text="Selection" icon="cursor" {onClick} />
