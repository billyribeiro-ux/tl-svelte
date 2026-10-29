import type { Component } from 'svelte'
import type { Editor, T, TLUiIconJsx } from 'svelte-draw'
import type { PortDataType } from '../../constants'
import { NODE_WIDTH_PX } from '../../constants'
import type { PortId, ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import type { NodeType } from '../nodeTypes'

/**
 * Pipeline values can be strings (prompts, image URLs, model IDs), numbers (steps, cfg scale),
 * or null (no value yet).
 */
export type PipelineValue = string | number | null

/**
 * A special value that can be returned from a node to indicate that execution should stop.
 */
export type STOP_EXECUTION = typeof STOP_EXECUTION
export const STOP_EXECUTION = Symbol('STOP_EXECUTION')

export interface SingleInfoValue {
	value: PipelineValue | STOP_EXECUTION
	isOutOfDate: boolean
	dataType: PortDataType
	multi?: false
}

export interface MultiInfoValue {
	value: (PipelineValue | STOP_EXECUTION)[]
	isOutOfDate: boolean
	dataType: PortDataType
	multi: true
}

export type InfoValue = SingleInfoValue | MultiInfoValue

export function isMultiInfoValue(v: InfoValue): v is MultiInfoValue {
	return v.multi === true
}

export interface InfoValues {
	[key: string]: InfoValue
}

export interface ExecutionResult {
	[key: string]: PipelineValue | STOP_EXECUTION
}

export interface InputValues {
	[key: string]: PipelineValue | PipelineValue[]
}

export interface NodeComponentProps<Node extends { type: string }> {
	shape: NodeShape
	node: Node
}

export abstract class NodeDefinition<Node extends { type: string }> {
	constructor(public readonly editor: Editor) {
		const ctor = this.constructor as NodeDefinitionConstructor<Node>
		this.type = ctor.type
		this.validator = ctor.validator
	}

	readonly type: Node['type']
	readonly validator: T.Validator<Node>
	abstract readonly title: string
	abstract readonly heading?: string
	abstract readonly icon: TLUiIconJsx
	/** A short category label for grouping in the toolbar. */
	abstract readonly category: string
	readonly resultKeys?: readonly string[]
	readonly canResizeNode: boolean = false
	/** If true, this node type is hidden from the toolbar and on-canvas picker. */
	readonly hidden: boolean = false

	getWidthPx(_shape: NodeShape, _node: Node): number {
		return NODE_WIDTH_PX
	}

	abstract getDefault(): Node
	abstract getBodyHeightPx(shape: NodeShape, node: Node): number
	abstract getPorts(shape: NodeShape, node: Node): Record<string, ShapePort>
	onPortConnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
	onPortDisconnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
	abstract getOutputInfo(shape: NodeShape, node: Node, inputs: InfoValues): InfoValues
	abstract execute(shape: NodeShape, node: Node, inputs: InputValues): Promise<ExecutionResult>
	abstract Component: Component<NodeComponentProps<Node>>
}

export interface NodeDefinitionConstructor<Node extends { type: string }> {
	new (editor: Editor): NodeDefinition<Node>
	readonly type: Node['type']
	readonly validator: T.Validator<Node>
}

/**
 * Update the `node` prop within a node shape.
 */
export function updateNode<T extends NodeType>(
	editor: Editor,
	shape: NodeShape,
	update: (node: T) => T,
	isOutOfDate: boolean = true
) {
	editor.updateShape({
		id: shape.id,
		type: shape.type,
		props: { node: update(shape.props.node as T), isOutOfDate },
	})
}

export function formatNumber(value: number): string {
	if (value === 0) return '0'
	if (!isFinite(value)) return value.toString()

	const absValue = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	if (absValue >= 1_000_000) {
		return sign + (absValue / 1_000_000).toPrecision(3) + 'M'
	}
	if (absValue >= 1_000) {
		return sign + (absValue / 1_000).toPrecision(3) + 'k'
	}

	if (absValue >= 1) {
		return sign + absValue.toPrecision(5).replace(/\.?0+$/, '')
	} else if (absValue >= 0.001) {
		return sign + absValue.toPrecision(3)
	} else {
		return value.toExponential(2)
	}
}

export function areAnyInputsOutOfDate(inputs: InfoValues): boolean {
	return Object.values(inputs).some((input) => input.isOutOfDate)
}

/**
 * Load a URL (data URL or http URL) into an HTMLImageElement.
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = (_e) => reject(new Error('Failed to load image'))
		img.crossOrigin = 'anonymous'
		img.src = url
	})
}

/**
 * Convert a Blob to a data URL via FileReader.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

// ---------------------------------------------------------------------------
// Input coercion helpers
// ---------------------------------------------------------------------------

/** Coerce any pipeline value to a string. */
export function coerceToText(value: PipelineValue, fallback = ''): string {
	if (value == null) return fallback
	if (typeof value === 'number') return String(value)
	return value
}

/** Coerce any pipeline value to a number. */
export function coerceToNumber(value: PipelineValue, fallback = 0): number {
	if (value == null) return fallback
	if (typeof value === 'number') return value
	const n = parseFloat(value)
	return Number.isNaN(n) ? fallback : n
}

/** Extract a single value from an InputValues entry (takes first element if array). */
export function getInput(inputs: InputValues, key: string): PipelineValue {
	const v = inputs[key]
	if (Array.isArray(v)) return v[0] ?? null
	return v ?? null
}

/** Always return an array from an InputValues entry. */
export function getInputMulti(inputs: InputValues, key: string): PipelineValue[] {
	const v = inputs[key]
	if (v == null) return []
	if (Array.isArray(v)) return v
	return [v]
}

/** Extract a single value and coerce to string. */
export function getInputText(inputs: InputValues, key: string, fallback = ''): string {
	return coerceToText(getInput(inputs, key), fallback)
}

/** Extract a single value and coerce to number. */
export function getInputNumber(inputs: InputValues, key: string, fallback = 0): number {
	return coerceToNumber(getInput(inputs, key), fallback)
}
