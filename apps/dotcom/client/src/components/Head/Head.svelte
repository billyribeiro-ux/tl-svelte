<script lang="ts">
	import { cspDev } from '../../utils/csp'
	import { isDevelopmentEnv, isPreviewEnv, isStagingEnv } from '../../utils/env'

	const showStagingFavicon = isStagingEnv || isPreviewEnv
</script>

<svelte:head>
	<link
		rel="icon"
		type="image/png"
		sizes="32x32"
		href={showStagingFavicon ? '/staging-favicon-32.png' : '/favicon-32x32.png'}
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="16x16"
		href={showStagingFavicon ? '/staging-favicon-16.png' : '/favicon-16x16.png'}
	/>
	<link rel="shortcut icon" href={showStagingFavicon ? '/staging-favicon.svg' : '/favicon.svg'} />
	<!-- In development, we don't have the HTTP headers for CSP. We emulate it here so that we can discover things locally. -->
	{#if isDevelopmentEnv}
		<meta http-equiv="content-security-policy" content={cspDev} />
	{/if}
</svelte:head>
