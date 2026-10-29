<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import { CommentTool, commentToolOverrides } from '@svelte-draw/commenting'
	import {
		commentSchemaRecords,
		createTLSchema,
		createTLStore,
		SvelteDraw,
		type TLComponents,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import CommentsLayer from './CommentsLayer.svelte'

	// Region comments are off by default. With `enableRegions`, dragging the comment tool out draws a
	// rectangle and anchors the comment to that area instead of a point or shape.
	const COMMENT_TOOLS = [CommentTool.configure({ enableRegions: true })]

	// Comments are stored as `comment-thread` and `comment` records in the editor's own store.
	// Registering `commentSchemaRecords` on the schema is all it takes to persist and sync them
	// alongside shapes — no separate backend, so the whole flow runs in-memory here.
	const store = createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) })

	const components: TLComponents = { InFrontOfTheCanvas: CommentsLayer }
</script>

<div class="svelte-draw__editor">
	<!-- `forceMobile` pins the mobile breakpoint on any screen size, so the mobile thread and
		composer placement is visible here on desktop. On a real device the same layout comes
		from the narrow viewport — the thread popover and composer position themselves against
		the visual viewport, riding up rather than hiding behind the software keyboard. -->
	<!-- Commenting is a licensed feature. Every feature is enabled in local development, but a
		deployed app needs a license key that includes commenting — swap in your own key here. -->
	<SvelteDraw
		forceMobile
		licenseKey={getLicenseKey()}
		{store}
		tools={COMMENT_TOOLS}
		overrides={[commentToolOverrides]}
		{components}
	/>
</div>
