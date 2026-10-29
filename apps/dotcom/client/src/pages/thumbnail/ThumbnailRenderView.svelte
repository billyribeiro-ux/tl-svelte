<script lang="ts">
	import type { ThumbnailRenderData } from '../thumbnail-render'
	import ThumbnailRenderError from './ThumbnailRenderError.svelte'
	import ThumbnailRenderPage from './ThumbnailRenderPage.svelte'

	let { data }: { data: ThumbnailRenderData } = $props()
</script>

{#if !data.ok}
	<ThumbnailRenderError message={data.message} />
{:else}
	<ThumbnailRenderPage
		token={data.token}
		records={data.records}
		schema={data.schema}
		renderParams={data.renderParams}
	/>
{/if}
