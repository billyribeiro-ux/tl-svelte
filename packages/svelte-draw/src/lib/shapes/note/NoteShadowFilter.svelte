<svelte:options namespace="svg" />

<script lang="ts">
	let { filterId }: { filterId: string } = $props()
</script>

<filter id={filterId} x="-10%" y="-10%" width="130%" height="150%">
	<feMorphology in="SourceAlpha" operator="erode" radius="3" result="erode1" />
	<feGaussianBlur in="erode1" stdDeviation="3" result="blur1" />
	<feOffset in="blur1" dy="3" result="offsetBlur1" />
	<feComponentTransfer in="offsetBlur1" result="shadow1">
		<feFuncA type="linear" slope="0.5" />
	</feComponentTransfer>
	<feMorphology in="SourceAlpha" operator="erode" radius="10" result="erode2" />
	<feGaussianBlur in="erode2" stdDeviation="6" result="blur2" />
	<feOffset in="blur2" dy="6" result="offsetBlur2" />
	<feComponentTransfer in="offsetBlur2" result="shadow2">
		<feFuncA type="linear" slope="0.5" />
	</feComponentTransfer>
	<feMerge>
		<feMergeNode in="shadow1" />
		<feMergeNode in="shadow2" />
		<feMergeNode in="SourceGraphic" />
	</feMerge>
</filter>
