import type { Component } from 'svelte'

/**
 * A component slot (`components.InFrontOfTheCanvas`, `SharePanel`, ...) is rendered with whatever
 * props the slot defines, which is none for the slots dotcom overrides. A React override closed over
 * what it needed (`() => <CommentsOnCanvas fileId={fileId} />`); this is the equivalent: it returns
 * a component that renders `Inner` with `props` merged into the props the slot passes. Pass getters
 * in `props` for values that change.
 */
export function withComponentProps<Props extends Record<string, unknown>>(
	Inner: Component<Props>,
	props: Props
): Component {
	const wrapper = (anchor: Parameters<Component>[0], slotProps: Record<string, unknown>) => {
		const merged = Object.defineProperties(
			{},
			{
				...Object.getOwnPropertyDescriptors(slotProps),
				...Object.getOwnPropertyDescriptors(props),
			}
		) as Props
		return Inner(anchor as Parameters<Component<Props>>[0], merged)
	}
	return wrapper as unknown as Component
}
