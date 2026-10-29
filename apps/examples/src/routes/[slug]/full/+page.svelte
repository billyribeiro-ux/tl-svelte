<script lang="ts">
	import ExampleWrapper from '../../../ExampleWrapper.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<meta name="robots" content="noindex, noimageindex, nofollow" />
</svelte:head>

{#key data.example.path}
	<ExampleWrapper example={data.example} component={data.component} />
{/key}
