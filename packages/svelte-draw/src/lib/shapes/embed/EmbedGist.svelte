<script lang="ts">
	import { toDomPrecision } from '@svelte-draw/editor'
	import { getRotatedBoxShadow } from '../shared/rotated-box-shadow'
	import { styleToString } from '../shared/styleToString'
	import { getGistSrcDoc } from './embedHelpers'

	let {
		id,
		sandbox,
		isInteractive,
		width,
		height,
		pageRotation,
		showShadow,
	}: {
		id: string
		sandbox: string
		isInteractive: boolean
		width: number
		height: number
		pageRotation: number
		showShadow: boolean
	} = $props()

	// Security warning:
	// Gists allow adding .json extensions to the URL which return JSONP.
	// Furthermore, the JSONP can include callbacks that execute arbitrary JavaScript.
	// It _is_ sandboxed by the iframe but we still want to disable it nonetheless.
	// We restrict the id to only allow hexdecimal characters to prevent this.
	// Read more:
	//   https://github.com/bhaveshk90/Content-Security-Policy-CSP-Bypass-Techniques
	//   https://github.com/renniepak/CSPBypass
	const srcdoc = $derived.by(() => {
		if (!id.match(/^[0-9a-f]+$/)) throw Error('No gist id!')
		return getGistSrcDoc(id)
	})
</script>

<!-- svelte-ignore a11y_missing_attribute, a11y_no_noninteractive_tabindex -->
<iframe
	class="tl-embed"
	{sandbox}
	draggable={false}
	width={toDomPrecision(width)}
	height={toDomPrecision(height)}
	frameborder="0"
	scrolling="no"
	referrerpolicy="strict-origin-when-cross-origin"
	tabindex={isInteractive ? 0 : -1}
	style={styleToString({
		pointerEvents: isInteractive ? 'all' : 'none',
		// Fix for safari <https://stackoverflow.com/a/49150908>
		zIndex: isInteractive ? '' : '-1',
		boxShadow: showShadow ? getRotatedBoxShadow(pageRotation) : 'none',
	})}
	{srcdoc}
></iframe>
