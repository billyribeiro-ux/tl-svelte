import { describe, expect, it } from 'vitest'
import { isTldrFile } from './svelteDrawOfflineFiles.svelte'

describe('isTldrFile', () => {
	it.each(['board.tldr', 'board.TLDR', 'board.TlDr'])('recognizes %s', (name) => {
		expect(isTldrFile(new File([], name))).toBe(true)
	})

	it.each(['board.svelte-draw', 'board.json', 'board'])('rejects %s', (name) => {
		expect(isTldrFile(new File([], name))).toBe(false)
	})
})
