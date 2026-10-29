<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		acceptedImageMimeTypes={['image/jpeg']}
		acceptedVideoMimeTypes={[]}
		maxImageDimension={Infinity}
		maxAssetSize={1 * 1024 * 1024}
	/>
	<!--
		acceptedImageMimeTypes: only allow jpegs
		acceptedVideoMimeTypes: don't allow any videos
		maxImageDimension: accept images of any dimension
		maxAssetSize: ...but only accept assets up to 1mb
	-->
</div>
