<script lang="ts">
	import type { LicenseManager } from '@svelte-draw/editor'
	import { getLicenseManagerAccessor } from './licenseContext'

	let { onManager }: { onManager: (manager: LicenseManager) => void } = $props()

	const getManager = getLicenseManagerAccessor()

	// records every manager the context hands out, like the React probe did on each render
	$effect(() => {
		onManager(getManager())
	})
</script>
