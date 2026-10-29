<script lang="ts">
	/** Calls the canvas hooks inside a component tree that has an editor, and reports their readers. */
	import type { TLShapeId } from '@svelte-draw/editor'
	import { transform } from '../transform'
	import { useGlobalMenuIsOpen } from '../useGlobalMenuIsOpen.svelte'
	import { useIsCropping, useIsEditing, usePeerIds } from '../useShapeState.svelte'

	let {
		shapeId,
		report,
	}: {
		shapeId: TLShapeId
		report: (readers: {
			isEditing: () => boolean
			isCropping: () => boolean
			peerIds: () => string[]
			menu: { readonly isOpen: boolean; onOpenChange(isOpen: boolean): void }
		}) => void
	} = $props()

	// svelte-ignore state_referenced_locally
	const isEditing = useIsEditing(() => shapeId)
	// svelte-ignore state_referenced_locally
	const isCropping = useIsCropping(shapeId)
	const peerIds = usePeerIds()
	const menu = useGlobalMenuIsOpen('probe-menu')

	// svelte-ignore state_referenced_locally
	report({
		isEditing: () => isEditing.current,
		isCropping: () => isCropping.current,
		peerIds: () => peerIds.current,
		menu,
	})
</script>

<div data-testid="transformed" {@attach transform(10, 20, 2, 0.5, { x: 1, y: 2 })}></div>
<div data-testid="not-transformed" {@attach transform(undefined, 20)}></div>
