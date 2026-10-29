<script lang="ts">
	import { onMount } from 'svelte'
	import {
		acquireThumbnailRenderData,
		setThumbnailError,
		type ThumbnailRenderData,
	} from '../../pages/thumbnail-render'
	import ThumbnailRenderView from '../../pages/thumbnail/ThumbnailRenderView.svelte'

	// Everything the SPA boots before its router — Sentry, Clerk and its CDN fetch, the head manager,
	// the service worker — is deliberately absent: this route sits outside the (app) group, because a
	// capture pays for this page's load on every render, and none of it can appear in the pixels.
	//
	// A render failure must end in a terminal marker: a page with neither data-thumbnail-ready nor
	// data-thumbnail-error burns the whole Browser Run timeout instead of failing the capture in
	// milliseconds. The route error page the SPA route used to sit under is not available here; this
	// boundary (and the ErrorFallback override inside <SvelteDraw>) stands in for it. Deliberately no
	// window-level error or unhandledrejection handler: those fire on benign noise — a
	// ResizeObserver loop as the editor mounts and the camera fits — and would fail a capture that was
	// about to succeed.
	let data = $state<ThumbnailRenderData | null>(null)

	onMount(() => {
		acquireThumbnailRenderData(new URL(window.location.href))
			.then((result) => {
				data = result
			})
			// A rejected acquisition — a 200 whose body fails to parse, an unforeseen throw — reaches
			// the error marker through the same view as any other failure.
			.catch((error) => {
				data = { ok: false, message: error instanceof Error ? error.message : String(error) }
			})
	})
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	<!-- Mirrors the #root sizing from the app shell so the editor lays out identically here. -->
	<style>
		#root {
			position: relative;
			inset: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		/* The app's license shows the "made with tldraw" mark on the canvas. editor.toImage never
		   drew it, and a live capture rasterizes the DOM, so without this every live screenshot
		   carries the mark the export path never had. !important because the SDK injects its own
		   rule for this class (display: flex) after this sheet. */
		.tl-watermark_SEE-LICENSE {
			display: none !important;
		}
	</style>
</svelte:head>

{#if data}
	<svelte:boundary
		onerror={(error) => setThumbnailError(error instanceof Error ? error.message : String(error))}
	>
		<ThumbnailRenderView {data} />
		{#snippet failed()}{/snippet}
	</svelte:boundary>
{/if}
