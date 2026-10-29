<script lang="ts">
	import { assetUrl } from '#utils/asset-url.js'

	/**
	 * Hero image with CSS mask — MDX cannot run `assetUrl` inside inline `style` strings, so paths in
	 * `mask: url(/images/…)` would stay root-relative and break when docs use `ASSET_PREFIX`.
	 */
	let { gifSrc, maskSrc, alt }: { gifSrc: string; maskSrc: string; alt: string } = $props()

	const gif = $derived(assetUrl(gifSrc))
	const mask = $derived(assetUrl(maskSrc))
	const maskCss = $derived(`url(${mask}) luminance center 100% / 100% no-repeat`)
</script>

<div class="article__image" style="border: none">
	<img {alt} src={gif} style="mask: {maskCss}; -webkit-mask: {maskCss}" />
</div>
