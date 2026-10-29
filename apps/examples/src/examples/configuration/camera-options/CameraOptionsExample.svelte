<script lang="ts">
	import { SvelteDraw, type TLCameraOptions } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import BoundsDisplay from './BoundsDisplay.svelte'
	import CameraOptionsControlPanel from './CameraOptionsControlPanel.svelte'
	import { CAMERA_OPTIONS } from './cameraOptions'
	import PaddingDisplay from './PaddingDisplay.svelte'

	const options: { camera: TLCameraOptions } = { camera: CAMERA_OPTIONS }

	// [1]
	const components = {
		OnTheCanvas: BoundsDisplay,
		InFrontOfTheCanvas: PaddingDisplay,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} {options}>
		<CameraOptionsControlPanel />
	</SvelteDraw>
</div>
