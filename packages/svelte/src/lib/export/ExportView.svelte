<script lang="ts">
	import type { ShapeView } from '@svelte-draw/editor'
	import type { Component } from 'svelte'

	let { view }: { view: ShapeView } = $props()

	const View = $derived(view.component as Component<any>)
</script>

<View {...view.props} />
