<script lang="ts">
	import type { LicenseManager } from '@svelte-draw/editor'
	import LicenseProvider from './LicenseProvider.svelte'
	import LicenseProbe from './LicenseProbe.svelte'

	let {
		licenseKey,
		onManager,
	}: { licenseKey: string | undefined; onManager: (manager: LicenseManager) => void } = $props()
</script>

<LicenseProvider {licenseKey}>
	<LicenseProbe {onManager} />
</LicenseProvider>
