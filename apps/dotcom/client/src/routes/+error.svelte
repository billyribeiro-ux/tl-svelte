<script lang="ts">
	import ErrorPage from '../components/ErrorPage/ErrorPage.svelte'

	// Only reached for failures outside the `(app)` group (the thumbnail page); everything else is
	// handled by `(app)/+error.svelte`.
</script>

<ErrorPage
	messages={{
		header: 'Something went wrong',
		para1:
			'Please try refreshing the page. Still having trouble? Let us know at hello@svelte-draw.invalid.',
	}}
/>
