<script lang="ts">
	import { getLiveComments, getLiveCommentThreads } from '@svelte-draw/commenting'
	import {
		fromComputed,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
	} from 'svelte-draw'
	import { MODE_HINTS, MODE_LABELS, MODES, type HistoryMode } from './historyModes'
	
	let { mode, onModeChange }: { mode: HistoryMode; onModeChange(mode: HistoryMode): void } =
		$props()

	const editor = getEditor()
	const threads = fromComputed('comment threads', () => getLiveCommentThreads(editor))
	const comments = fromComputed('all comments', () =>
		getLiveComments(editor).sort((a, b) => a.createdAt - b.createdAt)
	)
	const canUndo = fromComputed('can undo', () => editor.getCanUndo())
	const canRedo = fromComputed('can redo', () => editor.getCanRedo())
</script>

<div class="tlui-menu comment-history-panel">
	<div class="comment-history-panel__row">
		{#each MODES as id (id)}
			<SvelteDrawUiButton type={mode === id ? 'primary' : 'normal'} onclick={() => onModeChange(id)}>
				<SvelteDrawUiButtonLabel>{MODE_LABELS[id]}</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
		{/each}
	</div>
	<div class="comment-history-panel__row">
		<SvelteDrawUiButton type="normal" disabled={!canUndo.current} onclick={() => editor.undo()}>
			<SvelteDrawUiButtonLabel>Undo</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<SvelteDrawUiButton type="normal" disabled={!canRedo.current} onclick={() => editor.redo()}>
			<SvelteDrawUiButtonLabel>Redo</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<span class="comment-history-panel__count">
			{threads.current.length}
			{threads.current.length === 1 ? 'thread' : 'threads'}, {comments.current.length}
			{comments.current.length === 1 ? 'comment' : 'comments'}
		</span>
	</div>
	<p class="comment-history-panel__hint">{MODE_HINTS[mode]}</p>
</div>
