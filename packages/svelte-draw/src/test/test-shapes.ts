import {
	AssetRecordType,
	type TLAsset,
	type TLAssetId,
	type TLBinding,
	type TLBindingCreate,
	type TLBindingId,
	type TLShape,
	type TLShapeId,
	type TLShapePartial,
	ZERO_INDEX_KEY,
	assert,
	createBindingId,
	createShapeId,
	getIndexAbove,
	isShapeId,
	mapObjectMapValues,
	omitFromStackTrace,
} from '@svelte-draw/editor'

// Re-export test helpers from their new location
export { base64ToPoints, createDrawSegments, pointsToBase64 } from '../lib/utils/test-helpers'

/** What a `TL.*` call returns: a plain description of a shape, binding or inline asset. */
export interface TestElement {
	readonly [testElementBrand]?: true
	readonly kind: 'shape' | 'asset' | 'binding'
	readonly type: string
	readonly props: Record<string, any>
}

type TestElements = TestElement | readonly TestElements[]

const testElementBrand = Symbol('testElement')

function isTestElement(value: unknown): value is TestElement {
	return typeof value === 'object' && value !== null && testElementBrand in value
}

interface CommonShapeProps {
	x?: number
	y?: number
	id?: TLShapeId
	rotation?: number
	isLocked?: number
	ref?: string
	/** Child shapes (and bindings). Arrays may be nested; they are flattened. */
	children?: TestElements
	opacity?: number
}

type FormatShapeProps<Props extends object> = {
	[K in keyof Props]?: Props[K] extends TLAssetId
		? TLAssetId | TestElement
		: Props[K] extends TLAssetId | null
			? TLAssetId | TestElement | null
			: Props[K]
}
type PropsForShape<Type extends TLShape['type']> = CommonShapeProps &
	FormatShapeProps<TLShape<Type>['props']>

type AssetByType<Type extends TLAsset['type']> = Extract<TLAsset, { type: Type }>
type PropsForAsset<Type extends string> = Type extends TLAsset['type']
	? Partial<AssetByType<Type>['props']>
	: Record<string, unknown>

interface BindingConnections {
	from?: string | TLShapeId
	to: string | TLShapeId
}

interface CommonBindingProps extends BindingConnections {
	ref?: string
	id?: TLBindingId
}

type PropsForBinding<Type extends TLBinding['type']> = CommonBindingProps &
	Partial<TLBinding<Type>['props']>

type BindingToCreate = TLBinding extends infer E
	? E extends TLBinding
		? {
				type: E['type']
				props: Partial<TLBinding<E['type']>['props']>
				id: TLBindingId | undefined
				parentId: TLShapeId | undefined
				ref: string | undefined
				connections: BindingConnections
			}
		: never
	: never

const elementFactory = (kind: TestElement['kind']) =>
	new Proxy(
		{},
		{
			get(_target, type) {
				return (props: Record<string, any> = {}): TestElement => ({
					[testElementBrand]: true,
					kind,
					type: type as string,
					props,
				})
			},
		}
	)

const tlAsset = elementFactory('asset') as {
	[K in TLAsset['type']]: (props?: PropsForAsset<K>) => TestElement
} & Record<string, (props?: PropsForAsset<string>) => TestElement>

const tlBinding = elementFactory('binding') as {
	[K in TLBinding['type']]: (props: PropsForBinding<K>) => TestElement
}

const tlShape = elementFactory('shape')

/**
 * TL - helpers for describing svelte-draw shapes in test cases without JSX:
 * `TL.geo({ ref: 'a', x: 10, children: [TL.geo({ ref: 'b' })] })`. Pass the result(s) to
 * `shapesFromSpec` (or `editor.createShapesFromSpec`).
 */
export const TL = new Proxy(
	{},
	{
		get(_target, key) {
			if (key === 'asset') return tlAsset
			if (key === 'binding') return tlBinding
			return (tlShape as Record<string, unknown>)[key as string]
		},
	}
) as { asset: typeof tlAsset; binding: typeof tlBinding } & {
	[K in TLShape['type']]: (props: PropsForShape<K>) => TestElement
} & Record<string, (props?: CommonShapeProps & Record<string, unknown>) => TestElement>

export function shapesFromSpec(shapes: TestElements, idPrefix = '') {
	const ids = { bindings: {} } as Record<string, TLShapeId> & {
		bindings: Record<string, TLBindingId>
	}
	const currentPageShapes: Array<TLShapePartial> = []
	const assets: Array<TLAsset> = []

	const bindingsToCreate: Array<BindingToCreate> = []

	function flatten(elements: TestElements): TestElement[] {
		return Array.isArray(elements) ? elements.flatMap((e) => flatten(e)) : [elements as TestElement]
	}

	function addChildren(children: TestElements, parentId?: TLShapeId) {
		let nextIndex = ZERO_INDEX_KEY

		for (const el of flatten(children)) {
			if (el.kind === 'asset') {
				throw new Error('TL.asset types can only be used as props')
			}

			if (el.kind === 'binding') {
				const bindingType = el.type as TLBinding['type']
				const { id, from, to, ref, ...props } = el.props
				const bindingRef: unknown = ref
				assert(
					bindingRef === undefined || typeof bindingRef === 'string',
					'ref must be string or undefined'
				)
				bindingsToCreate.push({
					type: bindingType,
					props,
					id,
					parentId,
					ref: bindingRef,
					connections: { from, to },
				})
			} else {
				const shapeType = el.type

				const props: any = mapObjectMapValues(el.props, (key: string, value: any) => {
					// Only elements built by `TL.*` are special: other objects (such as a rich text
					// doc, which also has a `type`) are plain prop values.
					if (key === 'children' || !isTestElement(value)) return value
					if (value.kind === 'shape') {
						throw new Error("TL.* shape types can't be used as props.")
					}
					if (value.kind !== 'asset') return value
					const assetType = value.type

					// inline assets:
					const asset = AssetRecordType.create({
						type: assetType as TLAsset['type'],
						props: value.props as any,
					})

					assets.push(asset)

					return asset.id
				})

				let id
				const ref = props.ref as string | undefined
				if (ref) {
					assert(!ids[ref], `Duplicate ref: ${ref}`)
					assert(!props.id, `Cannot use both ref and id on shape: ${ref}`)
					id = createShapeId(`${idPrefix}${ref}`)
					ids[ref] = id
				} else if (props.id) {
					id = props.id
				} else {
					id = createShapeId()
				}

				const x: number = props.x ?? 0
				const y: number = props.y ?? 0

				const shapePartial = {
					id,
					type: shapeType,
					x,
					y,
					index: nextIndex,
					props: {},
				} as TLShapePartial

				nextIndex = getIndexAbove(nextIndex)

				if (parentId) {
					shapePartial.parentId = parentId
				}

				for (const [key, value] of Object.entries(props)) {
					if (key === 'x' || key === 'y' || key === 'ref' || key === 'id' || key === 'children') {
						continue
					}
					if (key === 'rotation' || key === 'isLocked' || key === 'opacity') {
						shapePartial[key] = value as any
						continue
					}
					;(shapePartial.props as Record<string, unknown>)[key] = value
				}

				currentPageShapes.push(shapePartial)

				if (props.children) {
					addChildren(props.children, id)
				}
			}
		}
	}

	addChildren(shapes)

	const bindings: TLBindingCreate[] = []
	for (const { id, parentId, ref, connections, ...binding } of bindingsToCreate) {
		let fromId: TLShapeId, toId: TLShapeId
		if (connections.from) {
			assert(typeof connections.from === 'string', 'from must be a ref string or a shape id')
			if (isShapeId(connections.from)) {
				fromId = connections.from
			} else {
				assert(ids[connections.from], `Ref not found: ${connections.from}`)
				fromId = ids[connections.from]
			}
		} else if (parentId) {
			fromId = parentId
		} else {
			throw new Error('from must be specified, or binding must be a child of a shape')
		}

		assert(connections.to, 'to must be specified')
		assert(typeof connections.to === 'string', 'to must be a ref string or a shape id')
		if (isShapeId(connections.to)) {
			toId = connections.to
		} else {
			assert(ids[connections.to], `Ref not found: ${connections.to}`)
			toId = ids[connections.to]
		}

		let bindingId = id
		if (ref) {
			assert(typeof ref === 'string', 'binding ref must be string')
			assert(!ids.bindings[ref], `Duplicate ref: ${ref}`)
			assert(!bindingId, `Cannot use both ref and id on binding: ${ref}`)
			bindingId = createBindingId(`${idPrefix}${ref}`)
			ids.bindings[ref] = bindingId
		}
		if (!bindingId) {
			bindingId = createBindingId()
		}

		bindings.push({
			...binding,
			id: bindingId,
			fromId,
			toId,
		})
	}

	return {
		ids: new Proxy(ids, {
			get: omitFromStackTrace((target, key) => {
				if (!(key in target)) {
					throw new Error(
						`Cannot access ID '${String(
							key
						)}'. No ref with that name was specified.\nAvailable refs: ${Object.keys(ids).join(
							', '
						)}`
					)
				}
				return target[key as string]
			}),
		}),
		shapes: currentPageShapes,
		assets,
		bindings,
	}
}
