<script lang="ts">
	import {
		fromComputed,
		getEditor,
		nativeEvents,
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		type TLShapeId,
	} from 'svelte-draw'
	import { AddIcon, SubtractIcon } from '../../components/icons/icons.svelte'
	import type { PortId } from '../../ports/Port'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodeRow from './NodeRow.svelte'
	import { STOP_EXECUTION } from './shared'

	/**
	 * A row in a node for a numeric input. If the port is connected, the input is disabled and the
	 * value is taken from the port. Otherwise, the input is editable with a spinner for incrementing
	 * and decrementing the value.
	 */
	let {
		shapeId,
		portId,
		label,
		value,
		onChange,
		onBlur,
	}: {
		shapeId: TLShapeId
		portId: PortId
		label?: string
		value: number
		onChange: (value: number) => void
		onBlur?: () => void
	} = $props()

	const editor = getEditor()
	let input = $state<HTMLInputElement | null>(null)

	// Re-created when the props change so the computed follows the new shape/port.
	const portInfo = $derived(
		fromComputed('from port', () => getNodeInputPortValues(editor, shapeId)[portId])
	)
	const valueFromPort = $derived(portInfo.current?.value)
	const isOutOfDate = $derived(portInfo.current?.isOutOfDate)

	let pendingValue = $state<string | null>(null)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (event) => event.stopPropagation() })

	function onSpinner(delta: number) {
		const newValue = value + delta
		onChange(newValue)
		pendingValue = String(newValue)
		input?.focus()
	}

	const displayValue = $derived(
		isOutOfDate
			? '...'
			: typeof valueFromPort === 'number'
				? valueFromPort
				: valueFromPort != null
					? String(valueFromPort)
					: (pendingValue ?? value)
	)
</script>

<NodeRow class="NodeInputRow">
	<Port {shapeId} {portId} />
	{#if label}<span class="NodeInputRow-label">{label}</span>{/if}
	{#if isOutOfDate || valueFromPort === STOP_EXECUTION}
		<NodePlaceholder />
	{:else}
		<input
			bind:this={input}
			type="text"
			inputmode="decimal"
			disabled={valueFromPort != null}
			value={displayValue}
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
	<!-- The spinner buttons stop pointerdown from reaching the editor: the listener sits on their wrapper. -->
	<div class="NodeInputRow-buttons" {@attach stopPointerDown}>
		<SvelteDrawUiButton title="decrement" type="icon" onclick={() => onSpinner(-1)}>
			<SvelteDrawUiButtonIcon icon={SubtractIcon} />
		</SvelteDrawUiButton>
		<SvelteDrawUiButton title="increment" type="icon" onclick={() => onSpinner(1)}>
			<SvelteDrawUiButtonIcon icon={AddIcon} />
		</SvelteDrawUiButton>
	</div>
</NodeRow>
