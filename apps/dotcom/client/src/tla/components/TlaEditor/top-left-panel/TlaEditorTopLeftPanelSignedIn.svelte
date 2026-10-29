<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		pageMenu: { defaultMessage: 'Page menu' },
	})
</script>

<script lang="ts">
	import {
		DefaultPageMenu,
		EditSubmenu,
		ExportFileContentSubMenu,
		ExtrasGroup,
		fromComputed,
		getDialogs,
		getEditor,
		getTranslation,
		PreferencesGroup,
		SvelteDrawUiButton,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuSubmenu,
	} from 'svelte-draw'
	import { withDialogProps } from '../../../../utils/withDialogProps'
	import { getIntl } from '../../../../utils/intl'
	import { params, searchParams } from '../../../../utils/router.svelte'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getCurrentFileId } from '../../../hooks/useCurrentFileId.svelte'
	import { getHasFileAdminRights } from '../../../hooks/useIsFileOwner.svelte'
	import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'
	import ImportFileActionItem from '../../menu-items/ImportFileActionItem.svelte'
	import FileItems from '../../TlaFileMenu/FileItems.svelte'
	import TlaFileMenu from '../../TlaFileMenu/TlaFileMenu.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { editorMessages } from '../editor-messages'
	import styles from '../top.module.css'
	import TlaFileNameEditor from './TlaFileNameEditor.svelte'
	import TlaRenameFileDialog from './TlaRenameFileDialog.svelte'
	import TlaViewSubmenu from './TlaViewSubmenu.svelte'

	const SEPARATOR = '/'

	const msg = getTranslation()
	const editor = getEditor()
	const intl = getIntl()
	const { addDialog } = getDialogs()
	let isRenaming = $state(false)
	const pageMenuLbl = $derived(msg(messages.pageMenu))

	const isEmbed = $derived(!!searchParams.get('embed'))

	const fileSlug = $derived(params.fileSlug ?? '_not_a_file_') // fall back to a string that will not match any file
	const isOwner = getHasFileAdminRights(() => fileSlug)

	const app = getApp()
	// Undefined on legacy routes (/r, /ro, /v, /s): the file-bound actions have nothing to act on.
	const currentFileId = getCurrentFileId()
	const fileId = $derived(currentFileId.current)
	const untitledProject = $derived(intl.current.formatMessage(editorMessages.untitledProject))
	// The Svelte inputs are captured outside the computed, which does not track Svelte state.
	const fileName = $derived.by(() => {
		const id = fileId
		const untitled = untitledProject
		return fromComputed(
			'fileName',
			// TODO(david): This is a temporary fix for allowing guests to see the file name.
			// We update the name in the document record on it's DO when the file record changes.
			// We should figure out a way to have a single source of truth for the file name.
			// And to allow guests to 'subscribe' to file metadata updates somehow.
			() =>
				// we need that backup file name for empty file names (the initial value for the name is empty)
				app.current.getFileName(id ?? null, false)?.trim() ||
				editor.getDocumentSettings().name ||
				// rather than displaying the date for the project here, display Untitled project
				untitled
		)
	})

	function handleFileNameChange(name: string) {
		if (!isOwner.current || !fileId) return
		isRenaming = false
		// only actually update the name if name is a value, otherwise keep the previous name
		if (name) {
			// don't allow guests to update the file name
			app.current.updateFile(fileId, { name })
			editor.updateDocumentSettings({ name })
		}
	}

	function handleRenameAction() {
		if (getIsCoarsePointer()) {
			addDialog({
				component: withDialogProps(TlaRenameFileDialog, {
					fileName: fileName.current,
					onSubmit: (newName: string) => {
						if (fileId) app.current.updateFile(fileId, { name: newName })
					},
				}),
			})
		} else {
			isRenaming = true
		}
	}
	function handleRenameEnd() {
		isRenaming = false
	}
</script>

<!-- spacer for the sidebar toggle button -->
{#if !isEmbed}
	<div style="width: 40px; flex-shrink: 0"></div>
{/if}
<TlaFileNameEditor
	source="file-header"
	{isRenaming}
	fileName={fileName.current}
	onChange={isOwner.current ? handleFileNameChange : undefined}
	onEnd={handleRenameEnd}
/>
<span class={styles.topLeftPanelSeparator}>{SEPARATOR}</span>
<DefaultPageMenu />
<TlaFileMenu
	fileId={fileId ?? ''}
	workspaceId={null}
	source="file-header"
	onRenameAction={handleRenameAction}
>
	{#snippet trigger({ props })}
		<SvelteDrawUiButton
			{...props}
			type="icon"
			class={styles.topLeftMainMenuTrigger}
			tooltip={pageMenuLbl}
			title={pageMenuLbl}
			data-testid="tla-main-menu"
		>
			<TlaIcon icon="dots-vertical-strong" />
		</SvelteDrawUiButton>
	{/snippet}
	<SvelteDrawUiMenuGroup id="regular-stuff">
		{#if fileId}
			<SvelteDrawUiMenuSubmenu id="file" label={msg(editorMessages.file)}>
				<FileItems
					source="file-header"
					{fileId}
					onRenameAction={handleRenameAction}
					workspaceId={null}
				/>
				<ImportFileActionItem />
			</SvelteDrawUiMenuSubmenu>
		{/if}
		<EditSubmenu />
		<TlaViewSubmenu />
		<ExportFileContentSubMenu />
		<ExtrasGroup />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="preferences">
		<PreferencesGroup />
	</SvelteDrawUiMenuGroup>
</TlaFileMenu>
