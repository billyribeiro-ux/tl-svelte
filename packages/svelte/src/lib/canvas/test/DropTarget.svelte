<script lang="ts">
	import { dropHandlers } from './dropHandlers'
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div data-testid="drop-target" ondrop={(e) => dropHandlers.onDrop(e)}></div>
