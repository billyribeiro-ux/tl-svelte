<script lang="ts">
	import {
		ARRANGE_ACTIONS,
		EDIT_ACTIONS,
		REORDER_ACTIONS,
	} from '../../../lib/ui/components/menu-items/constants'
	import { createSomeActionsEnabled } from '../../../lib/ui/hooks'

	const edit = createSomeActionsEnabled(() => EDIT_ACTIONS)
	const arrange = createSomeActionsEnabled(() => ARRANGE_ACTIONS)
	const reorder = createSomeActionsEnabled(() => REORDER_ACTIONS)
	const states = $derived([edit.current, arrange.current, reorder.current])
</script>

<span data-testid="probe">{states.join(' ')}</span>
