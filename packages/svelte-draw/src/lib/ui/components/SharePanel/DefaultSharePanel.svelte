<script lang="ts">
	import { getUiComponents } from '../../context/components'

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
</script>

{#if components.PeopleMenu}
	{@const PeopleMenu = components.PeopleMenu}
	<div class="tlui-share-zone" draggable={false}>
		<PeopleMenu />
	</div>
{/if}
