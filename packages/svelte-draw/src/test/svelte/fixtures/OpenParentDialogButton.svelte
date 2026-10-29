<script lang="ts">
	import { getDialogs } from '../../../lib/ui/context/dialogs'
	import DialogThatOpensNested from './DialogThatOpensNested.svelte'

	const { addDialog } = getDialogs()
</script>

<button data-testid="open-parent" onclick={() => addDialog({ component: DialogThatOpensNested })}>
	open parent
</button>
