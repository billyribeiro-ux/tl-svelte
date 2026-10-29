<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import { nativeEvents } from './nativeEvents'
	import { useEfficientZoomThreshold } from './useEfficientZoomThreshold.svelte'

	const LINK_ICON =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' fill='none'%3E%3Cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 5H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6M19 5h6m0 0v6m0-6L13 17'/%3E%3C/svg%3E"

	let { url }: { url: string } = $props()

	const editor = getEditor()
	const hideButton = useEfficientZoomThreshold()

	function markAsHandledOnShiftKey(e: PointerEvent) {
		if (!editor.inputs.getShiftKey()) editor.markEventAsHandled(e)
	}

	const mask = `url("${LINK_ICON}") center 100% / 100% no-repeat`
</script>

<a
	class={['tl-hyperlink-button', hideButton.current && 'tl-hyperlink-button__hidden']}
	href={url}
	target="_blank"
	rel="noopener noreferrer"
	{@attach nativeEvents({ pointerdown: markAsHandledOnShiftKey, pointerup: markAsHandledOnShiftKey })}
	title={url}
	draggable={false}
>
	<div class="tl-hyperlink__icon" style:mask style:-webkit-mask={mask}></div>
</a>
