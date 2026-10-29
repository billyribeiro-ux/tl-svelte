<script lang="ts">
	import {
		getEditor,
		reverseRecordsDiff,
		squashRecordDiffs,
		SvelteDrawUiSlider,
		type RecordsDiff,
	} from 'svelte-draw'

	interface TimelineEntry {
		timestamp: number
		diff: RecordsDiff<any>
	}

	interface TimelineState {
		entries: TimelineEntry[]
		currentIndex: number
	}

	const editor = getEditor()

	let timeline = $state.raw<TimelineState>({
		entries: [],
		currentIndex: 0,
	})

	// [1]
	function recordChange(diff: RecordsDiff<any>) {
		const newEntry: TimelineEntry = {
			timestamp: Date.now(),
			diff,
		}

		// [2]
		const newEntries = [...timeline.entries.slice(0, timeline.currentIndex), newEntry]
		timeline = {
			entries: newEntries,
			currentIndex: newEntries.length,
		}
	}

	// [3]
	$effect(() => {
		return editor.store.listen(
			({ changes }) => {
				recordChange(changes)
			},
			{ scope: 'document', source: 'user' }
		)
	})

	// [4]
	function navigateToIndex(targetIndex: number) {
		if (targetIndex === timeline.currentIndex) return

		const { entries, currentIndex } = timeline

		const isForward = targetIndex > currentIndex
		const diffsToApply = entries
			.slice(Math.min(currentIndex, targetIndex), Math.max(currentIndex, targetIndex))
			.map((entry) => entry.diff)

		if (diffsToApply.length > 0) {
			if (!isForward) diffsToApply.reverse()

			let diffToApply =
				diffsToApply.length === 1 ? diffsToApply[0] : squashRecordDiffs(diffsToApply)

			if (!isForward) {
				diffToApply = reverseRecordsDiff(diffToApply)
			}

			editor.store.mergeRemoteChanges(() => {
				editor.store.applyDiff(diffToApply)
			})
		}

		timeline = { ...timeline, currentIndex: targetIndex }
	}

	const isEmpty = $derived(timeline.entries.length === 0)

	const length = $derived(Math.max(3, String(timeline.entries.length).length))
</script>

<div class="timeline-scrubber-controls">
	<div class="timeline-scrubber-info">
		{isEmpty
			? '000 / 000'
			: `${timeline.currentIndex.toString().padStart(length, '0')} / ${timeline.entries.length.toString().padStart(length, '0')}`}
	</div>
	<SvelteDrawUiSlider
		steps={timeline.entries.length}
		value={isEmpty ? 1 : timeline.currentIndex}
		label="History"
		title={timeline.currentIndex === 0
			? 'Empty canvas'
			: new Date(
					timeline.entries[timeline.currentIndex - 1]?.timestamp ?? Date.now()
				).toLocaleString()}
		onValueChange={navigateToIndex}
	/>
</div>

<!--
[1]
Each store change becomes one timeline entry holding its `RecordsDiff`. Index 0 is the empty
canvas, index n is the state after the nth change.

[2]
If the user edits while scrubbed back (`currentIndex < entries.length`), the entries after
the current point are discarded and the new change starts a fresh branch from there.

[3]
`store.listen` with `scope: 'document'` ignores presence and session records (camera,
selection), and `source: 'user'` ignores changes we apply ourselves during navigation, so
time travel doesn't record itself.

[4]
Moving from one index to another collects the diffs in between, squashes them into one with
`squashRecordDiffs`, reverses it with `reverseRecordsDiff` when going backwards, and applies
it inside `store.mergeRemoteChanges` so it arrives with `source: 'remote'` and is neither
recorded by our listener nor pushed onto the undo stack.
-->
