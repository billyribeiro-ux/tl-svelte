<script lang="ts">
	import type { TlaFile } from '@svelte-draw/dotcom-shared'
	import { F, getEditor } from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { getAuth } from '../../../../utils/clerk.svelte'
	import FormattedRelativeTime from '../../../../utils/FormattedRelativeTime.svelte'
	import { params } from '../../../../utils/router.svelte'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { copyTextToClipboard } from '../../../utils/copy'
	import TlaMenuControl from '../../tla-menu/TlaMenuControl.svelte'
	import TlaMenuControlGroup from '../../tla-menu/TlaMenuControlGroup.svelte'
	import TlaMenuControlInfoTooltip from '../../tla-menu/TlaMenuControlInfoTooltip.svelte'
	import TlaMenuControlLabel from '../../tla-menu/TlaMenuControlLabel.svelte'
	import TlaMenuDetail from '../../tla-menu/TlaMenuDetail.svelte'
	import TlaMenuSection from '../../tla-menu/TlaMenuSection.svelte'
	import TlaMenuSwitch from '../../tla-menu/TlaMenuSwitch.svelte'
	import TlaMenuTabsPage from '../../tla-menu/TlaMenuTabsPage.svelte'
	import TlaButton from '../../TlaButton/TlaButton.svelte'
	import { fromDerivedComputed } from '../../../hooks/fromDerivedComputed.svelte'
	import TlaShareMenuCopyButton from '../TlaShareMenuCopyButton.svelte'

	// add errors to zero-polyfill toasts
	// const messages = defineMessages({
	// 	publishChangesError: { defaultMessage: 'Could not publish changes' },
	// 	publishFileError: { defaultMessage: 'Could not publish file' },
	// 	deleteError: { defaultMessage: 'Could not delete' },
	// })

	let { file }: { file: TlaFile } = $props()

	const editor = getEditor()
	const app = getApp()
	const auth = getAuth()
	const trackEvent = getSvelteDrawAppUiEvents()

	const publishedSlug = $derived(file.publishedSlug)
	const published = $derived(file.published)
	const isOwner = fromDerivedComputed(
		'isOwner',
		() => file.id,
		(id) => app.current.canUpdateFile(id)
	)
	let hasPublishedChanges = $state(false)

	async function publish(isPublishingChanges: boolean) {
		if (!editor) throw Error('no editor')
		if (!params.fileSlug) throw Error('no file slug')
		if (!isOwner.current) throw Error('not owner')
		const token = await auth.current.getToken()
		if (!token) throw Error('no token')

		if (isPublishingChanges) {
			hasPublishedChanges = true
		}

		app.current.publishFile(file.id)

		trackEvent('publish-file', { source: 'file-share-menu' })
	}

	async function unpublish() {
		if (!isOwner.current) throw Error('not owner')

		const token = await auth.current.getToken()
		if (!token) throw Error('no token')

		app.current.unpublishFile(file.id)
		trackEvent('unpublish-file', { source: 'file-share-menu' })
	}

	const publishShareUrl = $derived(
		publishedSlug ? routes.tlaPublish(publishedSlug, { asUrl: true }) : null
	)

	const secondsSince = $derived(Math.min(0, Math.floor((file.lastPublished - Date.now()) / 1000)))
	const learnMoreUrl = 'https://svelte-draw.invalid/Publishing-1283e4c324c08059a1a1d9ba9833ddc9'

	function handleCopyPublishLink() {
		if (!publishShareUrl) return
		copyTextToClipboard(editor.createDeepLink({ url: publishShareUrl }).toString())
		trackEvent('copy-publish-link', { source: 'file-share-menu' })
	}
</script>

{#snippet lastPublishedDate()}
	<FormattedRelativeTime value={secondsSince} numeric="auto" updateIntervalInSeconds={15} />
{/snippet}

<TlaMenuTabsPage id="publish">
	<TlaMenuSection>
		<TlaMenuControlGroup>
			{#if isOwner.current}
				<TlaMenuControl>
					<TlaMenuControlLabel htmlFor="tla-publish-this-file-switch">
						<F defaultMessage="Publish this file" />
					</TlaMenuControlLabel>
					<TlaMenuControlInfoTooltip
						onclick={() =>
							trackEvent('open-url', {
								destinationUrl: learnMoreUrl,
								source: 'file-share-menu',
							})}
						href={learnMoreUrl}
					>
						<F defaultMessage="Learn more about publishing." />
					</TlaMenuControlInfoTooltip>
					<TlaMenuSwitch
						id="tla-publish-this-file-switch"
						checked={published}
						onChange={() => (published ? unpublish() : publish(false))}
					/>
				</TlaMenuControl>
			{/if}
		</TlaMenuControlGroup>
		{#if published}
			{#if publishShareUrl}
				<TlaShareMenuCopyButton onClick={handleCopyPublishLink}>
					<F defaultMessage="Copy link" />
				</TlaShareMenuCopyButton>
			{/if}
			{#if isOwner.current}
				<TlaButton
					iconRight={hasPublishedChanges ? 'check' : 'update'}
					variant="secondary"
					onclick={() => publish(true)}
				>
					<F defaultMessage="Publish changes" />
				</TlaButton>
			{/if}
			<TlaMenuDetail>
				<F
					defaultMessage="Last published <date></date>"
					description="This is used to show the last time the file was published. An example is 'Last published 5 minutes ago'."
					tags={{ date: lastPublishedDate }}
				/>
			</TlaMenuDetail>
		{/if}
		<!-- {published && publishShareUrl && <QrCode url={publishShareUrl} />} -->
	</TlaMenuSection>
</TlaMenuTabsPage>
