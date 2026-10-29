<script lang="ts">
	import Heroicon from './Heroicon.svelte'
</script>

<button
	id="back-to-top"
	onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
	class="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 dark:hover:bg-blue-400"
>
	<Heroicon name="20/solid/ArrowLongUp" class="h-3.5 -mr-px" />
	<span>Scroll to top</span>
</button>
