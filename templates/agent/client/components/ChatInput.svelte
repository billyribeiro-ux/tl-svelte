<script lang="ts">
	import { fromComputed } from '@svelte-draw/svelte'
	import type { Editor } from 'svelte-draw'
	import AtIcon from '../../shared/icons/AtIcon.svelte'
	import BrainIcon from '../../shared/icons/BrainIcon.svelte'
	import ChevronDownIcon from '../../shared/icons/ChevronDownIcon.svelte'
	import { AGENT_MODEL_DEFINITIONS, type AgentModelName } from '../../shared/models'
	import type { SvelteDrawAgent } from '../agent/SvelteDrawAgent'
	import ContextItemTag from './ContextItemTag.svelte'
	import SelectionTag from './SelectionTag.svelte'

	let {
		agent,
		handleSubmit,
		inputRef = $bindable(null),
	}: {
		agent: SvelteDrawAgent
		handleSubmit: (e: SubmitEvent & { currentTarget: HTMLFormElement }) => void
		inputRef?: HTMLTextAreaElement | null
	} = $props()

	const editor = $derived(agent.editor)
	let inputValue = $state('')

	const isGenerating = fromComputed('isGenerating', () => agent.requests.isGenerating())

	const isContextToolActive = fromComputed('isContextToolActive', () => {
		const tool = editor.getCurrentTool()
		return tool.id === 'target-shape' || tool.id === 'target-area'
	})

	const selectedShapes = fromComputed('selectedShapes', () => editor.getSelectedShapes())
	const contextItems = fromComputed('contextItems', () => agent.context.getItems())
	const modelName = fromComputed('modelName', () => agent.modelName.getModelName())

	const ADD_CONTEXT_ACTIONS = [
		{
			name: 'Pick Shapes',
			onSelect: (editor: Editor) => {
				editor.setCurrentTool('target-shape')
				editor.focus()
			},
		},
		{
			name: 'Pick Area',
			onSelect: (editor: Editor) => {
				editor.setCurrentTool('target-area')
				editor.focus()
			},
		},
		{
			name: ' ',
			onSelect: (editor: Editor) => {
				const currentTool = editor.getCurrentTool()
				if (currentTool.id === 'target-area' || currentTool.id === 'target-shape') {
					editor.setCurrentTool('select')
				}
			},
		},
	]
</script>

<div class="chat-input">
	<form
		onsubmit={(e) => {
			e.preventDefault()
			// The textarea is read from the DOM inside handleSubmit before this state change is flushed
			inputValue = ''
			handleSubmit(e)
		}}
	>
		<div class="prompt-tags">
			<div class={'chat-context-select ' + (isContextToolActive.current ? 'active' : '')}>
				<div class="chat-context-select-label">
					<AtIcon /> Add Context
				</div>
				<select
					id="chat-context-select"
					value=" "
					onchange={(e) => {
						const select = e.currentTarget
						const action = ADD_CONTEXT_ACTIONS.find((action) => action.name === select.value)
						if (action) action.onSelect(editor)
						// React kept this select controlled at " "; reset it so it always shows the label
						select.value = ' '
					}}
				>
					{#each ADD_CONTEXT_ACTIONS as action (action.name)}
						<option value={action.name}>
							{action.name}
						</option>
					{/each}
				</select>
			</div>
			{#if selectedShapes.current.length > 0}
				<SelectionTag onClick={() => editor.selectNone()} />
			{/if}
			{#each contextItems.current as item, i ('context-item-' + i)}
				<ContextItemTag {editor} onClick={() => agent.context.remove(item)} {item} />
			{/each}
		</div>

		<textarea
			bind:this={inputRef}
			bind:value={inputValue}
			name="input"
			autocomplete="off"
			placeholder="Ask, learn, brainstorm, draw"
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault()
					//idk about this but it works oops -max
					const form = e.currentTarget.closest('form')
					if (form) {
						const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
						form.dispatchEvent(submitEvent)
					}
				}
			}}
		></textarea>
		<span class="chat-actions">
			<div class="chat-actions-left">
				<div class="chat-model-select">
					<div class="chat-model-select-label">
						<BrainIcon />
						{modelName.current}
					</div>
					<select
						value={modelName.current}
						onchange={(e) => agent.modelName.setModelName(e.currentTarget.value as AgentModelName)}
					>
						{#each Object.values(AGENT_MODEL_DEFINITIONS) as model (model.name)}
							<option value={model.name}>
								{model.name}
							</option>
						{/each}
					</select>
					<ChevronDownIcon />
				</div>
			</div>
			<button class="chat-input-submit" disabled={inputValue === '' && !isGenerating.current}>
				{isGenerating.current && inputValue === '' ? '◼' : '⬆'}
			</button>
		</span>
	</form>
</div>
