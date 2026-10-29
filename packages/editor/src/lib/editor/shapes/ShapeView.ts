/**
 * An opaque, framework-owned UI component. The editor core never inspects it; the UI binding
 * package (`@svelte-draw/svelte`) knows how to mount it.
 *
 * @public
 */
export type ViewComponent = unknown

/**
 * What a {@link ShapeUtil} returns from `component`, `backgroundComponent`, `toSvg` and
 * `toBackgroundSvg`: a UI component plus the props to mount it with.
 *
 * @public
 */
export interface ShapeView<Props extends object = object> {
	readonly component: ViewComponent
	readonly props: Props
}

/** @public */
export function shapeView<Props extends object>(
	component: ViewComponent,
	props: Props
): ShapeView<Props> {
	return { component, props }
}
