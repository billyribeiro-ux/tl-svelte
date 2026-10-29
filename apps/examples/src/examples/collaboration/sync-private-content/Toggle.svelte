<script lang="ts">
	let { isChecked }: { isChecked: boolean } = $props()

	const height = 20
	const width = 40
	const pillSize = height - 4
</script>

<div
	style:cursor="pointer"
	style:width="{width}px"
	style:height="{height}px"
	style:border-radius="{height / 2}px"
	style:background-color={isChecked ? '#4bb05e' : '#999'}
	style:display="flex"
	style:align-items="center"
	style:justify-content={isChecked ? 'flex-end' : 'flex-start'}
	style:padding="2px"
>
	{#if isChecked}
		<div
			style:font-size="9px"
			style:font-weight="600"
			style:color="white"
			style:position="relative"
			style:left="-3px"
		>
			ON
		</div>
	{/if}
	<div
		style:width="{pillSize}px"
		style:height="{pillSize}px"
		style:border-radius="{pillSize / 2}px"
		style:background-color="white"
	></div>
	{#if !isChecked}
		<div
			style:font-size="9px"
			style:font-weight="600"
			style:color="white"
			style:position="relative"
			style:right="-1px"
		>
			OFF
		</div>
	{/if}
</div>
