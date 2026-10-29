<script lang="ts" module>
	import { defineMessages, type TLVideoShape } from '@svelte-draw/editor'

	/** @public */
	export interface DefaultVideoToolbarContentProps {
		videoShapeId: TLVideoShape['id']
		onEditAltTextStart(): void
	}

	const messages = defineMessages({
		actionDownloadOriginal: {
			id: 'action.download-original',
			defaultMessage: 'Download original',
		},
		toolReplaceMedia: { id: 'tool.replace-media', defaultMessage: 'Replace media…' },
		toolMediaAltText: { id: 'tool.media-alt-text', defaultMessage: 'Alternative text' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getActions } from '../../context/actions.svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'

	let { videoShapeId, onEditAltTextStart }: DefaultVideoToolbarContentProps = $props()

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const msg = getTranslation()
	const source = 'video-toolbar'
	// `track` made the React component re-render when this changed.
	const isReadonly = fromComputed('is readonly', () => editor.getIsReadonly())

	const actions = getActions()

	function handleVideoReplace() {
		actions['video-replace'].onSelect('video-toolbar')
	}

	function handleVideoDownload() {
		actions['download-original'].onSelect('video-toolbar')
	}

	const altText = fromComputed(
		'altText',
		() => editor.getShape<TLVideoShape>(videoShapeId)!.props.altText
	)
</script>

{#if !isReadonly.current}
	<SvelteDrawUiToolbarButton
		type="icon"
		title={msg(messages.toolReplaceMedia)}
		onclick={handleVideoReplace}
		data-testid="tool.video-replace"
	>
		<SvelteDrawUiButtonIcon small icon="tool-media" />
	</SvelteDrawUiToolbarButton>
{/if}
<SvelteDrawUiToolbarButton
	type="icon"
	title={msg(messages.actionDownloadOriginal)}
	onclick={handleVideoDownload}
	data-testid="tool.video-download"
>
	<SvelteDrawUiButtonIcon small icon="download" />
</SvelteDrawUiToolbarButton>
{#if altText.current || !isReadonly.current}
	<SvelteDrawUiToolbarButton
		type="icon"
		isActive={!!altText.current}
		title={msg(messages.toolMediaAltText)}
		data-testid="tool.video-alt-text"
		onclick={() => {
			trackEvent('alt-text-start', { source })
			onEditAltTextStart()
		}}
	>
		<SvelteDrawUiButtonIcon small icon="alt" />
	</SvelteDrawUiToolbarButton>
{/if}
