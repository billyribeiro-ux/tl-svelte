<script lang="ts">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		fromComputed,
		getEditor,
		nativeEvents,
		type TLShapeId,
	} from 'svelte-draw'
	import { addIcon, subtractIcon } from '../../components/icons/icons.svelte'
	import type { PortId } from '../../ports/Port'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeRow from './NodeRow.svelte'
	import NodeValue from './NodeValue.svelte'
	import { STOP_EXECUTION } from './shared'

	/**
	 * A row in a node for a numeric input. If the port is connected, the input is disabled and the
	 * value is taken from the port. Otherwise, the input is editable with a spinner for incrementing
	 * and decrementing the value.
	 */
	let {
		shapeId,
		portId,
		value,
		onChange,
		onBlur,
	}: {
		shapeId: TLShapeId
		portId: PortId
		value: number
		onChange: (value: number) => void
		onBlur?: () => void
	} = $props()

	const editor = getEditor()
	let inputRef = $state<HTMLInputElement | null>(null)
	const portInfo = fromComputed('from port', () => getNodeInputPortValues(editor, shapeId)[portId])
	const valueFromPort = $derived(portInfo.current?.value)
	const isOutOfDate = $derived(portInfo.current?.isOutOfDate)

	let pendingValue = $state<string | null>(null)

	// Svelte delegates `pointerdown` to the app root, which is too late to keep the editor's native
	// canvas listeners from seeing it, so stopping propagation needs a native listener.
	const stopPointerDown = nativeEvents({
		pointerdown: (event) => {
			event.stopPropagation()
		},
	})

	function onSpinner(delta: number) {
		const newValue = value + delta
		onChange(newValue)
		pendingValue = String(newValue)
		inputRef?.focus()
	}
</script>

<NodeRow class="NodeInputRow">
	<Port {shapeId} {portId} />
	{#if isOutOfDate || valueFromPort === STOP_EXECUTION}
		<NodeValue value={isOutOfDate ? STOP_EXECUTION : (valueFromPort as typeof STOP_EXECUTION)} />
	{:else}
		<input
			bind:this={inputRef}
			type="text"
			inputmode="decimal"
			disabled={valueFromPort != null}
			value={valueFromPort ?? pendingValue ?? value}
			oninput={(e) => {
				pendingValue = e.currentTarget.value
				const asNumber = Number(e.currentTarget.value.trim())
				if (Number.isNaN(asNumber)) return
				onChange(asNumber)
			}}
			{@attach stopPointerDown}
			onblur={() => {
				pendingValue = null
				onBlur?.()
			}}
			onfocus={() => {
				editor.setSelectedShapes([shapeId])
			}}
		/>
	{/if}
	<div class="NodeInputRow-buttons" {@attach stopPointerDown}>
		<SvelteDrawUiButton title="decrement" type="icon" onclick={() => onSpinner(-1)}>
			<SvelteDrawUiButtonIcon icon={subtractIcon} />
		</SvelteDrawUiButton>
		<SvelteDrawUiButton title="increment" type="icon" onclick={() => onSpinner(1)}>
			<SvelteDrawUiButtonIcon icon={addIcon} />
		</SvelteDrawUiButton>
	</div>
</NodeRow>
