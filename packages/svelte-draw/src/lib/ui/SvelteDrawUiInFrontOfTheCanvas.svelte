<script lang="ts">
	import { getUiComponents } from './context/components'

	/** @public */
	const components = getUiComponents()
</script>

{#if components.RichTextToolbar}
	{@const RichTextToolbar = components.RichTextToolbar}
	<RichTextToolbar />
{/if}
{#if components.ImageToolbar}
	{@const ImageToolbar = components.ImageToolbar}
	<ImageToolbar />
{/if}
{#if components.VideoToolbar}
	{@const VideoToolbar = components.VideoToolbar}
	<VideoToolbar />
{/if}
{#if components.CursorChatBubble}
	{@const CursorChatBubble = components.CursorChatBubble}
	<CursorChatBubble />
{/if}
