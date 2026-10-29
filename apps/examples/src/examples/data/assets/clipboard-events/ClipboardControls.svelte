<script lang="ts">
	import { state, updateState } from './clipboardState.svelte'
</script>

<div class="clipboard-events-panel">
	<div class="clipboard-events-controls">
		<label>
			<input
				type="checkbox"
				checked={state.disableCopy}
				onchange={() => updateState({ disableCopy: !state.disableCopy })}
			/>
			Block copy/cut
		</label>
		<label>
			<input
				type="checkbox"
				checked={state.disablePaste}
				onchange={() => updateState({ disablePaste: !state.disablePaste })}
			/>
			Block paste
		</label>
		<label>
			<input
				type="checkbox"
				checked={state.filterRedOnCopy}
				onchange={() => updateState({ filterRedOnCopy: !state.filterRedOnCopy })}
			/>
			Filter red on copy
		</label>
		<label>
			<input
				type="checkbox"
				checked={state.filterRedOnPaste}
				onchange={() => updateState({ filterRedOnPaste: !state.filterRedOnPaste })}
			/>
			Filter red on paste
		</label>
		<label>
			<input
				type="checkbox"
				checked={state.handleRawPaste}
				onchange={() => updateState({ handleRawPaste: !state.handleRawPaste })}
			/>
			Handle raw paste (take over)
		</label>
		<label>
			<input
				type="checkbox"
				checked={state.useAsyncCallbacks}
				onchange={() => updateState({ useAsyncCallbacks: !state.useAsyncCallbacks })}
			/>
			Async callbacks (500ms delay)
		</label>
	</div>
	<div class="clipboard-events-log" data-testid="clipboard-log">
		{#if state.log.length === 0}
			<span class="clipboard-events-empty">No events yet</span>
		{/if}
		{#each state.log as entry, i (i)}
			<div class="clipboard-events-entry" data-testid="clipboard-log-entry">
				<strong>{entry.action}</strong> via <em>{entry.source}</em>{entry.prevented
					? ' (blocked)'
					: ''}{entry.detail ? ` — ${entry.detail}` : ''}
			</div>
		{/each}
	</div>
</div>
