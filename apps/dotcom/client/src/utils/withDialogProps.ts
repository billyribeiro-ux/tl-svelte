import type { Component } from 'svelte'

/**
 * The SDK's `addDialog({ component })` renders `component` with `{ onClose }` and nothing else. A
 * React dialog closed over what it needed (`component: ({ onClose }) => <Dialog id={id} onClose={onClose} />`);
 * this is the equivalent: it returns a component that renders `Dialog` with `extra` merged into the
 * props the dialog host passes (the host's `onClose` always wins), keeping the host's props live.
 *
 * @example
 * ```ts
 * addDialog({ component: withDialogProps(TlaDeleteFileDialog, { fileId }) })
 * ```
 */
export function withDialogProps<Extra extends Record<string, unknown>>(
	Dialog: Component<{ onClose(): void } & Extra>,
	extra: Extra
): Component<{ onClose(): void }> {
	const wrapper = (
		anchor: Parameters<Component<{ onClose(): void }>>[0],
		hostProps: { onClose(): void }
	) => {
		const props = Object.defineProperties(
			{},
			{
				...Object.getOwnPropertyDescriptors(extra),
				onClose: { enumerable: true, get: () => hostProps.onClose },
			}
		) as { onClose(): void } & Extra
		return Dialog(anchor, props)
	}
	return wrapper as unknown as Component<{ onClose(): void }>
}
