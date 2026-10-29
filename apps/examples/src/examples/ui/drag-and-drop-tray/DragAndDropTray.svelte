<script lang="ts" module>
	import type { Vec } from 'svelte-draw'
	import type { TrayItem } from './trayitems'

	// [1]
	export type DragState =
		| {
				name: 'idle'
		  }
		| {
				name: 'pointing_item'
				item: TrayItem
				startPosition: Vec
		  }
		| {
				name: 'dragging'
				item: TrayItem
				currentPosition: Vec
		  }
</script>

<script lang="ts">
	import { atom, Box, fromSignal, getEditor, quickReactor, Vec as VecClass } from 'svelte-draw'
	import { TRAY_ITEMS } from './trayitems'

	// [2]
	let trayContainer = $state<HTMLDivElement | null>(null)
	let draggingImage = $state<HTMLDivElement | null>(null)

	const editor = getEditor()

	// [3]
	const dragState = atom<DragState>('dragState', { name: 'idle' })

	// [4]
	let target: HTMLDivElement | null = null

	function handlePointerMove(e: PointerEvent) {
		const current = dragState.get()
		const screenPoint = new VecClass(e.clientX, e.clientY)

		switch (current.name) {
			case 'idle': {
				break
			}
			case 'pointing_item': {
				const dist = VecClass.Dist(screenPoint, current.startPosition)
				if (dist > 10) {
					// [a]
					dragState.set({
						name: 'dragging',
						item: current.item,
						currentPosition: screenPoint,
					})
				}
				break
			}
			case 'dragging': {
				// [b]
				dragState.set({
					...current,
					currentPosition: screenPoint,
				})
				break
			}
		}
	}

	function handlePointerUp(e: PointerEvent) {
		const current = dragState.get()

		target = e.currentTarget as HTMLDivElement
		target.releasePointerCapture(e.pointerId)

		switch (current.name) {
			case 'idle': {
				break
			}
			case 'pointing_item': {
				dragState.set({
					name: 'idle',
				})
				break
			}
			case 'dragging': {
				// [c]
				const screenPoint = new VecClass(e.clientX, e.clientY)
				const pagePoint = editor.screenToPage(screenPoint)

				editor.markHistoryStoppingPoint('create shape from tray')

				editor.createShape({
					...current.item.shapeBase,
					x: pagePoint.x - 50, // center on cursor at 100x100
					y: pagePoint.y - 50,
				})

				dragState.set({
					name: 'idle',
				})

				break
			}
		}

		removeEventListeners()
	}

	function handlePointerDown(e: PointerEvent) {
		e.preventDefault()
		target = e.currentTarget as HTMLDivElement
		target.setPointerCapture(e.pointerId)

		const itemIndex = target.dataset.drag_item_index!
		const item = TRAY_ITEMS[+itemIndex]

		if (!item) return

		const startPosition = new VecClass(e.clientX, e.clientY)

		// [d]
		dragState.set({
			name: 'pointing_item',
			item,
			startPosition,
		})

		target.addEventListener('pointermove', handlePointerMove)
		document.addEventListener('keydown', handleKeyDown)
	}

	function handleKeyDown(e: KeyboardEvent) {
		const current = dragState.get()
		if (e.key === 'Escape' && current.name === 'dragging') {
			removeEventListeners()
		}
	}

	function removeEventListeners() {
		if (target) {
			target.removeEventListener('pointermove', handlePointerMove)
			document.removeEventListener('keydown', handleKeyDown)
		}

		dragState.set({
			name: 'idle',
		})
	}

	const dragSnapshot = fromSignal(dragState)

	// [5]
	$effect(() => {
		const imageRef = draggingImage
		const trayContainerRef = trayContainer
		if (!imageRef || !trayContainerRef) return

		return quickReactor('drag-image-style', () => {
			const current = dragState.get()

			switch (current.name) {
				case 'idle':
				case 'pointing_item': {
					imageRef.style.display = 'none'
					break
				}
				case 'dragging': {
					const trayContainerRect = trayContainerRef.getBoundingClientRect()
					const box = new Box(
						trayContainerRect.x,
						trayContainerRect.y,
						trayContainerRect.width,
						trayContainerRect.height
					)
					const viewportScreenBounds = editor.getViewportScreenBounds()
					const isInside = Box.ContainsPoint(box, current.currentPosition)
					if (isInside) {
						imageRef.style.display = 'none'
					} else {
						imageRef.style.position = 'absolute'
						imageRef.style.pointerEvents = 'none'
						imageRef.style.left = '0px'
						imageRef.style.top = '0px'
						imageRef.style.transform = `translate(${current.currentPosition.x - viewportScreenBounds.x - 25}px, ${current.currentPosition.y - viewportScreenBounds.y - 25}px)`
						imageRef.style.width = '50px'
						imageRef.style.height = '50px'
						imageRef.style.fontSize = '40px'
						imageRef.style.display = 'flex'
						imageRef.style.alignItems = 'center'
					}
				}
			}
		})
	})
</script>

<!-- [6] -->
<div class="drag-tray" bind:this={trayContainer}>
	<div class="drag-tray-items">
		{#each TRAY_ITEMS as item, index (item.id)}
			<div
				class="drag-tray-item"
				data-drag_item_index={index}
				role="presentation"
				onpointerdown={handlePointerDown}
				onpointerup={handlePointerUp}
			>
				{item.emoji}
			</div>
		{/each}
	</div>
</div>
<!-- [7] -->
<div bind:this={draggingImage}>{dragSnapshot.current.name === 'dragging' ? dragSnapshot.current.item.emoji : ''}</div>
