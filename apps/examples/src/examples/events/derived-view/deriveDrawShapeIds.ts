import {
	computed,
	Editor,
	isShape,
	isUninitialized,
	RESET_VALUE,
	type TLShapeId,
} from 'svelte-draw'

// [2]
export function deriveDrawShapeIds(editor: Editor) {
	const { store } = editor
	const shapeIds = store.query.ids('shape')

	function fromScratch() {
		return new Set([...shapeIds.get()].filter((id) => editor.getShape(id)!.type === 'draw'))
	}

	return computed<Set<TLShapeId>>('drawShapeIds', (prevValue, lastComputedEpoch) => {
		// [3]
		if (isUninitialized(prevValue)) {
			return fromScratch()
		}

		// [4]
		const diff = store.history.getDiffSince(lastComputedEpoch)
		if (diff === RESET_VALUE) {
			return fromScratch()
		}

		// [5]
		let nextValue: Set<TLShapeId> | undefined

		for (const changes of diff) {
			for (const record of Object.values(changes.added)) {
				if (isShape(record) && record.type === 'draw') {
					nextValue ??= new Set(prevValue)
					nextValue.add(record.id)
				}
			}

			for (const record of Object.values(changes.removed)) {
				if (isShape(record) && record.type === 'draw') {
					nextValue ??= new Set(prevValue)
					nextValue.delete(record.id)
				}
			}
		}

		// [6]
		return nextValue ?? prevValue
	})
}
