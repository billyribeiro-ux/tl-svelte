<script lang="ts">
	import { getToasts } from 'svelte-draw'
	import { getMaybeApp } from '../hooks/useAppState.svelte'

	const toasts = getToasts()
	const app = getMaybeApp()

	function assign() {
		const current = app.current
		if (current) current.toasts = toasts
	}
	assign()
	$effect.pre(assign)
</script>
