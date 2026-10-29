<script lang="ts">
	import { createIsToolSelected, fromComputed, getEditor, getTools, fromSignal } from 'svelte-draw'
	import { getContext } from 'svelte'
	import { PRIVATE_MODE_KEY, type PrivateModeAtom } from './privateMode'
	import Toggle from './Toggle.svelte'
	import VisibilityIcon from './VisibilityIcon.svelte'

	const editor = getEditor()
	const tools = getTools()
	const isInSelectTool = createIsToolSelected(() => tools.current.select)
	const myPrivateSelectedShapes = fromComputed('private shapes', () => {
		const userId = editor.user.getExternalId()
		return editor
			.getSelectedShapes()
			.filter((shape) => !!shape.meta.private && shape.meta.ownerId === userId)
	})

	// [3]
	const isPrivateMode$ = getContext<PrivateModeAtom>(PRIVATE_MODE_KEY)
	const isPrivateMode = fromSignal(isPrivateMode$)

	const count = $derived(myPrivateSelectedShapes.current.length)

	function makePublic() {
		editor.markHistoryStoppingPoint()
		// [7]
		const allAffectedShapes = [
			...editor.getShapeAndDescendantIds(myPrivateSelectedShapes.current.map((s) => s.id)),
		].map((id) => editor.getShape(id)!)
		editor.updateShapes(
			allAffectedShapes.map((shape) => ({
				...shape,
				meta: { ...shape.meta, private: false },
			}))
		)
	}
</script>

{#if isInSelectTool.current && count > 0}
	<div class="toggle-panel">
		<div>
			Make {count} selected shape{count > 1 ? 's' : ''} public?
		</div>
		<button onclick={makePublic}>Yes</button>
	</div>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="toggle-panel pointer" onclick={() => isPrivateMode$.update((v) => !v)}>
		<VisibilityIcon off={isPrivateMode.current} fill="#444" />
		<div>Private mode</div>
		<Toggle isChecked={isPrivateMode.current} />
	</div>
{/if}
