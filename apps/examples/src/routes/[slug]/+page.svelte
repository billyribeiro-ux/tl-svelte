<script lang="ts">
	import ExamplePage from '../../ExamplePage.svelte'
	import ExampleWrapper from '../../ExampleWrapper.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<meta name="robots" content="noindex, noimageindex, nofollow" />
</svelte:head>

<!-- keyed so the sidebar (filter text, scroll) starts fresh on every example, as in the React app -->
{#key data.example.path}
	<ExamplePage example={data.example}>
		<ExampleWrapper example={data.example} component={data.component} />
	</ExamplePage>
{/key}
