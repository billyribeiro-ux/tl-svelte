<script lang="ts">
	import ExamplePage from '../ExamplePage.svelte'
	import ExampleWrapper from '../ExampleWrapper.svelte'

	let { data } = $props()
</script>

<ExamplePage example={data.example}>
	<ExampleWrapper example={data.example} component={data.component} />
</ExamplePage>
