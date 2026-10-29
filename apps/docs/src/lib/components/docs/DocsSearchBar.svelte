<script lang="ts">
	import SearchButton from '#lib/components/search/SearchButton.svelte'
</script>

<div
	class="hidden md:flex mx-auto px-5 sticky top-4 z-10 xl:max-w-3xl xl:px-0"
	style="width: 55%; margin-top: -56px"
>
	<div class="lg:max-w-3xl lg:pl-12 lg:pr-12 grow">
		<SearchButton type="docs" layout="desktop" />
	</div>
</div>
