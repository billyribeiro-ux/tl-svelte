<script lang="ts" module>
	export { playingCardIcon }
</script>

<!-- The toolbar icon: a snippet standing in for the React `<span>` element (it spreads the UI's props on it, like cloneElement). -->
{#snippet playingCardIcon({ props }: { props: Record<string, unknown> })}
	<span {...props} style="font-size: 2em; {props.style ?? ''}">🃏</span>
{/snippet}
