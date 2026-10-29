<script lang="ts">
	import { createSomeActionsEnabled } from '../../../lib/ui/hooks'

	let { ids }: { ids: string[] } = $props()

	const some = createSomeActionsEnabled(() => ids)
</script>

<span data-testid="some">{String(some.current)}</span>
