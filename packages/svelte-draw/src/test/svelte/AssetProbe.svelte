<script lang="ts">
	import { useImageOrVideoAsset, type UseImageOrVideoAssetOptions } from '../../lib/shapes/shared/useImageOrVideoAsset.svelte'

	let {
		options,
		sink,
	}: {
		options: UseImageOrVideoAssetOptions
		sink: { read?(): ReturnType<typeof snapshot> }
	} = $props()

	const asset = useImageOrVideoAsset(() => options)
	const snapshot = () => ({ asset: asset.asset, url: asset.url })
	// The sink is written once on creation so that tests can read the live value.
	// svelte-ignore state_referenced_locally
	sink.read = snapshot
</script>
