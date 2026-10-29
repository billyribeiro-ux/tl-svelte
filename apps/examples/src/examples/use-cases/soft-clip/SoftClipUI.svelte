<script lang="ts">
	import SoftClipControls from './SoftClipControls.svelte'
	import SoftClipOverlay from './SoftClipOverlay.svelte'

	let opacity = $state(0.3)
</script>

<SoftClipOverlay {opacity} />
<SoftClipControls {opacity} onOpacityChange={(value) => (opacity = value)} />
