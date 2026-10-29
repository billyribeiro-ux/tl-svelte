<script lang="ts">
	import type { Snippet } from 'svelte'
	import { assetUrl } from '#utils/asset-url.js'
	import Analytics from '#lib/components/common/Analytics.svelte'
	import AutoRefresh from '#lib/components/common/AutoRefresh.svelte'
	import Footer from '#lib/components/navigation/Footer.svelte'
	import Header from '#lib/components/navigation/Header.svelte'
	import '../app.css'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<title>svelte-draw: Build whiteboards in Svelte with the svelte-draw SDK</title>
	<meta
		name="description"
		content="The svelte-draw SDK provides tools, services, and APIs to build beautiful whiteboards and infinite canvas applications with real-time collaboration and a powerful Svelte-based canvas."
	/>
	<link rel="shortcut icon" href={assetUrl('/favicon.svg')} />
	<link rel="icon" href={assetUrl('/favicon-32x32.svg')} sizes="32x32" />
	<link rel="icon" href={assetUrl('/favicon-16x16.svg')} sizes="16x16" />
	<link rel="apple-touch-icon" href={assetUrl('/apple-touch-icon.png')} />
	<link rel="apple-touch-icon" href={assetUrl('/apple-touch-icon-152x152.svg')} sizes="152x152" />
	<link rel="apple-touch-icon" href={assetUrl('/apple-touch-icon-180x180.svg')} sizes="180x180" />
	<link rel="apple-touch-icon" href={assetUrl('/apple-touch-icon-167x167.svg')} sizes="167x167" />
</svelte:head>

{#if import.meta.env.DEV}
	<AutoRefresh>
		<Header />
		{@render children()}
		<Footer />
		<Analytics />
	</AutoRefresh>
{:else}
	<Header />
	{@render children()}
	<Footer />
	<Analytics />
{/if}
