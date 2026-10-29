import { fromComputed, tryGetEditor, type SignalValue } from '@svelte-draw/svelte'

/**
 * Whether the editor is in readonly mode. `false` outside of an editor tree. Call during component
 * initialisation. Replaces `useReadonly`.
 *
 * @public
 */
export function createReadonly(): SignalValue<boolean> {
	const editor = tryGetEditor()
	return fromComputed('isReadonlyMode', () => !!editor?.getIsReadonly())
}
