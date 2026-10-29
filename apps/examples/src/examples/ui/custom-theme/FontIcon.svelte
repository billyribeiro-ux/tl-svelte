<script lang="ts">
	// Style panel preview for a custom font: "Aa" rendered in the font itself.
	let { family }: { family: string } = $props()
</script>

<div style:font-family={family} style:font-size="16px" style:line-height="1">Aa</div>
