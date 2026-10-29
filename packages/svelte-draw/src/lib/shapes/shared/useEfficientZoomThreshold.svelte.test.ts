import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import HookProbe from '../../../test/svelte/HookProbe.svelte'
import { useEfficientZoomThreshold } from './useEfficientZoomThreshold.svelte'

let test: ReturnType<typeof createTestEditor>
let mounted: ReturnType<typeof mountInEditor> | undefined

beforeEach(() => {
	test = createTestEditor()
})
afterEach(() => {
	mounted?.unmount()
	mounted = undefined
	test.dispose()
})

describe('useEfficientZoomThreshold', () => {
	it('is true below the default threshold of 0.25 and updates with the camera', async () => {
		const sink: { read?(): unknown } = {}
		mounted = mountInEditor(test, HookProbe, { use: () => useEfficientZoomThreshold(), sink })
		expect(sink.read!()).toBe(false)

		test.editor.setCamera({ x: 0, y: 0, z: 0.2 })
		await flush()
		expect(sink.read!()).toBe(true)

		test.editor.setCamera({ x: 0, y: 0, z: 0.25 })
		await flush()
		expect(sink.read!()).toBe(false)
	})

	it('accepts a custom threshold, including a getter', async () => {
		const sink: { read?(): unknown } = {}
		let threshold = $state(2)
		mounted = mountInEditor(test, HookProbe, {
			use: () => useEfficientZoomThreshold(() => threshold),
			sink,
		})
		expect(sink.read!()).toBe(true) // zoom 1 < 2
		threshold = 0.5
		await flush()
		expect(sink.read!()).toBe(false)
	})
})
