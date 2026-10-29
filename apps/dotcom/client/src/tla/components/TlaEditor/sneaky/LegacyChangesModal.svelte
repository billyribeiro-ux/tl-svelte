<script lang="ts">
	import {
		F,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { trackEvent } from '../../../../utils/analytics'
	import { getAuth } from '../../../../utils/clerk.svelte'
	import { navigate } from '../../../../utils/router.svelte'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getGetFileName, getRoomInfo } from '../useRoomInfo.svelte'
	import styles from './sneaky-legacy-modal.module.css'

	let { onClose }: { onClose(): void } = $props()

	const auth = getAuth()
	const app = getMaybeApp()
	const name = getGetFileName()
	// From the route params, not the raw pathname: see useFileEditorOverrides.
	const roomInfo = getRoomInfo()

	async function handleCopy() {
		const currentApp = app.current
		const room = roomInfo.current
		if (!currentApp || !room) return
		const res = await currentApp.createFile({
			name: name.current,
			createSource: `${room.prefix}/${room.id}`,
		})
		onClose()
		if (res?.ok) {
			const { fileId } = res.value
			navigate(routes.tlaFile(fileId))
			trackEvent('create-file', { source: 'legacy-import-button' })
		}
	}
</script>

<div class={styles.dialog}>
	<SvelteDrawUiDialogHeader>
		<SvelteDrawUiDialogTitle>
			<F defaultMessage="This file is now read-only" />
		</SvelteDrawUiDialogTitle>
		<SvelteDrawUiDialogCloseButton />
	</SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogBody>
		<p>
			{#if auth.current.isSignedIn}
				<F defaultMessage="To continue editing please copy the file to your files." />
			{:else}
				<F
					defaultMessage="This anonymous svelte-draw multiplayer file is now read-only. To continue editing, please sign in and copy it to your files."
				/>
			{/if}
		</p>
	</SvelteDrawUiDialogBody>
	<SvelteDrawUiDialogFooter class={styles.footer}>
		{#if auth.current.isSignedIn}
			<SvelteDrawUiButton type="primary" onclick={handleCopy}>
				<SvelteDrawUiButtonLabel>
					<F defaultMessage="Copy to personal workspace" />
				</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
		{/if}
		<SvelteDrawUiButton type="normal" onclick={onClose} ontouchend={onClose}>
			<SvelteDrawUiButtonLabel>
				<F defaultMessage="Close" />
			</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</SvelteDrawUiDialogFooter>
</div>
