<script lang="ts">
	import {
		fromSignal,
		getEditor,
		reverseRecordsDiff,
		squashRecordDiffs,
		SvelteDrawUiButton,
		SvelteDrawUiSlider,
		type RecordsDiff,
	} from 'svelte-draw'
	import { currentUserIdAtom, USERS } from './timelineUsers'

	// [2]
	interface AttributionTimelineEntry {
		timestamp: number
		diff: RecordsDiff<any>
		userId: string
		userName: string
		userColor: string | undefined
	}

	interface AttributionTimelineState {
		entries: AttributionTimelineEntry[]
		appliedCounts: Record<string, number>
	}

	const editor = getEditor()
	const activeUserId = fromSignal(currentUserIdAtom)

	// [3]
	// Replaced wholesale on every change, so a raw state is enough.
	let timeline = $state.raw<AttributionTimelineState>({
		entries: [],
		appliedCounts: {},
	})

	// [4]
	function recordChange(diff: RecordsDiff<any>) {
		const user = editor.store.props.users.currentUser.get()
		if (!user) return

		const newEntry: AttributionTimelineEntry = {
			timestamp: Date.now(),
			diff,
			userId: user.id,
			userName: user.name,
			userColor: user.color,
		}

		const prev = timeline
		const userId = user.id
		const applied = prev.appliedCounts[userId] ?? 0
		let userSeen = 0
		let truncated = false
		const newEntries: AttributionTimelineEntry[] = []
		for (const entry of prev.entries) {
			if (entry.userId === userId) {
				if (userSeen < applied) {
					newEntries.push(entry)
					userSeen++
				} else {
					truncated = true
				}
			} else {
				newEntries.push(entry)
			}
		}
		newEntries.push(newEntry)

		timeline = {
			entries: truncated ? newEntries : [...prev.entries, newEntry],
			appliedCounts: { ...prev.appliedCounts, [userId]: applied + 1 },
		}
	}

	$effect(() => {
		return editor.store.listen(
			({ changes }) => {
				recordChange(changes)
			},
			{ scope: 'document', source: 'user' }
		)
	})

	// [5]
	const userIndices = $derived.by(() => {
		const map: Record<string, number[]> = {}
		timeline.entries.forEach((entry, i) => {
			if (!map[entry.userId]) map[entry.userId] = []
			map[entry.userId].push(i)
		})
		return map
	})

	// [6]
	const totalApplied = $derived(
		Object.values(timeline.appliedCounts).reduce((sum, n) => sum + n, 0)
	)

	// [7]
	function handleUserSliderChange(userId: string, nextApplied: number) {
		const prevApplied = timeline.appliedCounts[userId] ?? 0
		if (nextApplied === prevApplied) return

		const indices = userIndices[userId]
		if (!indices) return

		const isForward = nextApplied > prevApplied
		const lo = Math.min(prevApplied, nextApplied)
		const hi = Math.max(prevApplied, nextApplied)

		const userDiffs: RecordsDiff<any>[] = []
		for (let i = lo; i < hi; i++) {
			userDiffs.push(timeline.entries[indices[i]].diff)
		}

		if (userDiffs.length > 0) {
			let diff = userDiffs.length === 1 ? userDiffs[0] : squashRecordDiffs(userDiffs)
			if (!isForward) {
				diff = reverseRecordsDiff(diff)
			}
			editor.store.mergeRemoteChanges(() => {
				editor.store.applyDiff(diff)
			})
		}

		timeline = {
			...timeline,
			appliedCounts: { ...timeline.appliedCounts, [userId]: nextApplied },
		}
	}

	// [8]
	function handleReset() {
		editor.store.mergeRemoteChanges(() => {
			const shapeIds = [...editor.getCurrentPageShapeIds()]
			if (shapeIds.length > 0) editor.deleteShapes(shapeIds)
		})
		timeline = { entries: [], appliedCounts: {} }
	}

	// [9]
	function handleAllSliderChange(nextValue: number) {
		const { entries, appliedCounts } = timeline

		const newAppliedCounts: Record<string, number> = {}
		for (let i = 0; i < nextValue; i++) {
			const id = entries[i].userId
			newAppliedCounts[id] = (newAppliedCounts[id] ?? 0) + 1
		}

		const currentlyApplied = new Array(entries.length).fill(false)
		const seen: Record<string, number> = {}
		entries.forEach((entry, i) => {
			const n = (seen[entry.userId] = (seen[entry.userId] ?? 0) + 1)
			if (n <= (appliedCounts[entry.userId] ?? 0)) currentlyApplied[i] = true
		})

		const ordered: RecordsDiff<any>[] = []
		for (let i = entries.length - 1; i >= 0; i--) {
			const targetApplied = i < nextValue
			if (currentlyApplied[i] && !targetApplied) {
				ordered.push(reverseRecordsDiff(entries[i].diff))
			}
		}
		for (let i = 0; i < entries.length; i++) {
			const targetApplied = i < nextValue
			if (!currentlyApplied[i] && targetApplied) {
				ordered.push(entries[i].diff)
			}
		}

		if (ordered.length > 0) {
			const diff = ordered.length === 1 ? ordered[0] : squashRecordDiffs(ordered)
			editor.store.mergeRemoteChanges(() => {
				editor.store.applyDiff(diff)
			})
		}

		timeline = { ...timeline, appliedCounts: newAppliedCounts }
	}

	const totalEntries = $derived(timeline.entries.length)
	const totalLength = $derived(Math.max(2, String(totalEntries).length))
	const allTitle = $derived.by(() => {
		if (totalEntries === 0) return 'No changes yet'
		if (totalApplied === 0) return 'Empty canvas'
		const recent = timeline.entries[totalApplied - 1]
		if (!recent) return ''
		const time = new Date(recent.timestamp).toLocaleTimeString()
		return `${recent.userName} — ${time}`
	})
</script>

<div class="attribution-timeline-controls">
	<div class="attribution-timeline-row attribution-timeline-row--all">
		<div class="attribution-timeline-user">
			<span class="attribution-timeline-name">All</span>
		</div>
		<SvelteDrawUiSlider
			steps={Math.max(totalEntries, 1)}
			value={totalEntries === 0 ? null : totalApplied}
			label="History"
			title={allTitle}
			onValueChange={handleAllSliderChange}
		/>
		<div class="attribution-timeline-info">
			{`${totalApplied.toString().padStart(totalLength, '0')} / ${totalEntries.toString().padStart(totalLength, '0')}`}
		</div>
		<SvelteDrawUiButton
			type="normal"
			disabled={totalEntries === 0}
			onclick={handleReset}
			tooltip="Clear the canvas and timeline history"
			class="attribution-timeline-reset"
		>
			Reset
		</SvelteDrawUiButton>
	</div>
	{#each Object.values(USERS) as user (user.id)}
		{@const indices = userIndices[user.id] ?? []}
		{@const total = indices.length}
		{@const applied = timeline.appliedCounts[user.id] ?? 0}
		{@const length = Math.max(2, String(total).length)}
		{@const isEmpty = total === 0}
		{@const sliderTitle = (() => {
			if (isEmpty) return `${user.name} hasn't made any changes yet`
			if (applied === 0) return `None of ${user.name}'s changes applied`
			const entry = timeline.entries[indices[applied - 1]]
			if (!entry) return ''
			const time = new Date(entry.timestamp).toLocaleTimeString()
			return `${user.name} — ${time}`
		})()}
		<div
			class={[
				'attribution-timeline-row',
				user.id === activeUserId.current && 'attribution-timeline-row--active',
			]}
		>
			<div class="attribution-timeline-user">
				<span class="attribution-timeline-dot" style:background-color={user.color}></span>
				<span class="attribution-timeline-name">{user.name}</span>
			</div>
			<SvelteDrawUiSlider
				steps={Math.max(total, 1)}
				value={isEmpty ? null : applied}
				label="History"
				title={sliderTitle}
				onValueChange={(value) => handleUserSliderChange(user.id, value)}
			/>
			<div class="attribution-timeline-info">
				{`${applied.toString().padStart(length, '0')} / ${total.toString().padStart(length, '0')}`}
			</div>
		</div>
	{/each}
</div>
