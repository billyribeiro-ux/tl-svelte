<script lang="ts" module>
	export { penIcon }
</script>

<!-- The toolbar icon, as a snippet that spreads the UI's props on the svg (like React's cloneElement). -->
{#snippet penIcon({ props }: { props: Record<string, unknown> })}
	<svg
		{...props}
		width="30"
		height="30"
		viewBox="0 0 30 30"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M5 3 17 6C24 8 26 13 24 19L19 24C13 26 8 24 6 17L3 5Z" />
		<path d="m24 19 4 4-5 5-4-4M4 4l8 8" />
		<circle cx="14.5" cy="14.5" r="3.5" />
	</svg>
{/snippet}
