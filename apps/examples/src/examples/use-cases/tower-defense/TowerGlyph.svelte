<script lang="ts">
	import type { TowerGeo } from './tower-config'

	let { geo }: { geo: TowerGeo } = $props()
	const stroke = 'currentColor'
</script>

<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
	{#if geo === 'triangle'}
		<polygon points="10,2 18,18 2,18" fill="none" {stroke} stroke-width="2" />
	{:else if geo === 'rectangle'}
		<rect x="2" y="4" width="16" height="12" fill="none" {stroke} stroke-width="2" />
	{:else}
		<ellipse cx="10" cy="10" rx="8" ry="6" fill="none" {stroke} stroke-width="2" />
	{/if}
</svg>
