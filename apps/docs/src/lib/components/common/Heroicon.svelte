<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'
	import { type HeroiconData, type HeroiconName, heroicons } from './icon/heroicons'

	let {
		name,
		class: className = undefined,
		...rest
	}: { name: HeroiconName; class?: string } & SVGAttributes<SVGSVGElement> = $props()

	const icon: HeroiconData = $derived(heroicons[name])
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon.viewBox}
	fill={icon.style === 'solid' ? 'currentColor' : 'none'}
	stroke={icon.style === 'outline' ? 'currentColor' : undefined}
	stroke-width={icon.style === 'outline' ? 1.5 : undefined}
	aria-hidden="true"
	data-slot="icon"
	class={className}
	{...rest}
>
	{#each icon.paths as path (path.d)}
		<path
			d={path.d}
			fill-rule={path.fillRule}
			clip-rule={path.clipRule}
			stroke-linecap={path.strokeLinecap}
			stroke-linejoin={path.strokeLinejoin}
		/>
	{/each}
</svg>
