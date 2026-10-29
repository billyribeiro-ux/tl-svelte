<script lang="ts">
	let { offsetX, offsetY }: { offsetX: number; offsetY: number } = $props()
</script>

<div
	style="width: 100%; height: 100%; margin-left: {offsetX}px; margin-top: {offsetY}px; font-size: 26px; text-align: center;"
>
	📍
</div>
