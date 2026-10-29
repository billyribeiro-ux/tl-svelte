<script lang="ts" module>
	import type { TLPageId } from '@svelte-draw/editor'

	/** @public */
	export interface PageItemInputProps {
		name: string
		id: TLPageId
		isCurrentPage: boolean
		onCancel(): void
		onComplete?(): void
	}
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import SvelteDrawUiInput from '../primitives/SvelteDrawUiInput.svelte'

	// `isCurrentPage` is retained for backwards compatibility but is no longer
	// used: mounting this input always indicates the user wants to rename, so
	// we always auto-focus regardless of whether the page is the current one.
	let { name, id, onCancel, onComplete }: PageItemInputProps = $props()

	const editor = getEditor()
	const trackEvent = getUiEvents()

	let mark: string | null = null

	function handleFocus() {
		mark = editor.markHistoryStoppingPoint('rename page')
	}

	function handleChange(value: string) {
		editor.renamePage(id, value || 'New Page')
		trackEvent('rename-page', { source: 'page-menu' })
	}

	function handleCancel() {
		if (mark) {
			editor.bailToMark(mark)
		}
		onCancel()
	}
</script>

<!--
	Blur commits the rename (the value has been live-saved via onValueChange)
	and exits editing, so clicking elsewhere closes the input.
-->
<SvelteDrawUiInput
	class="tlui-page-menu__item__input"
	defaultValue={name}
	onValueChange={handleChange}
	onComplete={() => onComplete?.()}
	onCancel={handleCancel}
	onFocus={handleFocus}
	onBlur={() => onComplete?.()}
	shouldManuallyMaintainScrollPositionWhenFocused
	autoFocus
	autoSelect
/>
