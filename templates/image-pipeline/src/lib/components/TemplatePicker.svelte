<script lang="ts">
	import {
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
	} from 'svelte-draw'
	import { saveSelectionAsTemplate, stampTemplate } from '../templates/templateActions'
	import { deleteTemplate, loadTemplates, type PipelineTemplate } from '../templates/templateState'
	import { TemplateIcon } from './icons/icons.svelte'

	/**
	 * A popover-style template picker shown in the toolbar area.
	 */
	const editor = getEditor()
	let isOpen = $state(false)
	let templates = $state.raw<PipelineTemplate[]>([])
	let saveName = $state('')

	function refresh() {
		templates = loadTemplates()
	}

	$effect(() => {
		if (isOpen) refresh()
	})

	function onSave() {
		if (!saveName.trim()) return
		const result = saveSelectionAsTemplate(editor, saveName.trim(), '')
		if (result) {
			saveName = ''
			refresh()
		}
	}

	function onStamp(template: PipelineTemplate) {
		const center = editor.getViewportPageBounds().center
		stampTemplate(editor, template, center)
		isOpen = false
	}

	function onDelete(id: string) {
		deleteTemplate(id)
		refresh()
	}
</script>

<SvelteDrawUiPopover id="template-picker" open={isOpen} onOpenChange={(open) => (isOpen = open)}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton {...props} type="icon" title="Templates">
				<SvelteDrawUiButtonIcon icon={TemplateIcon} />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent side="bottom" align="start" sideOffset={8}>
		<div class="TemplatePicker-popover">
			<div class="TemplatePicker-header">Templates</div>
			<div class="TemplatePicker-save">
				<input
					type="text"
					placeholder="Name for selection..."
					value={saveName}
					oninput={(e) => (saveName = e.currentTarget.value)}
					onkeydown={(e) => {
						if (e.key === 'Enter') onSave()
					}}
				/>
				<SvelteDrawUiButton type="normal" onclick={onSave}>
					<SvelteDrawUiButtonLabel>Save</SvelteDrawUiButtonLabel>
				</SvelteDrawUiButton>
			</div>
			<div class="TemplatePicker-list">
				{#if templates.length === 0}
					<div class="TemplatePicker-empty">Select 2+ nodes and save as a template</div>
				{:else}
					{#each templates as t (t.id)}
						<div class="TemplatePicker-item">
							<SvelteDrawUiButton
								type="menu"
								class="TemplatePicker-item-button"
								onclick={() => onStamp(t)}
							>
								<SvelteDrawUiButtonIcon icon={TemplateIcon} />
								<SvelteDrawUiButtonLabel>
									{t.name} ({t.nodes.length} nodes)
								</SvelteDrawUiButtonLabel>
							</SvelteDrawUiButton>
							<SvelteDrawUiButton type="icon" title="Delete template" onclick={() => onDelete(t.id)}>
								<SvelteDrawUiButtonLabel>×</SvelteDrawUiButtonLabel>
							</SvelteDrawUiButton>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
