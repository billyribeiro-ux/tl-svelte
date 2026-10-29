<script lang="ts">
	import Icon, { type IconName } from '#lib/components/common/icon/Icon.svelte'

	let { caption, icon, href }: { caption: string; icon: IconName; href: string } = $props()
</script>

<a {href} target="_blank" rel="noreferrer">
	<span class="sr-only">{caption}</span>
	<Icon {icon} class="h-4" />
</a>
