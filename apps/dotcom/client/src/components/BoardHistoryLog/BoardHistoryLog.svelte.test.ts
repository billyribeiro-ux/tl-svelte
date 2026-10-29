import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BoardHistoryLog, { groupTimestampsByMonth } from './BoardHistoryLog.svelte'

vi.mock('../../utils/router.svelte', () => ({ location: { pathname: '/f/abc/history' } }))

describe('groupTimestampsByMonth', () => {
	it('groups entries by month in first-seen order', () => {
		const groups = groupTimestampsByMonth([
			{ timestamp: '2025-03-02T10:00:00Z' },
			{ timestamp: '2025-03-01T10:00:00Z' },
			{ timestamp: '2025-02-20T10:00:00Z' },
		])
		expect(groups.map((g) => [g.month, g.timestamps.length])).toEqual([
			['March 2025', 2],
			['February 2025', 1],
		])
	})
})

describe('BoardHistoryLog', () => {
	let component: ReturnType<typeof mount> | undefined
	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		document.body.innerHTML = ''
	})

	it('renders the empty state', () => {
		component = mount(BoardHistoryLog, { target: document.body, props: { data: [] } })
		flushSync()
		expect(document.body.textContent).toContain('No history found')
	})

	it('links entries and shows load more', () => {
		const onLoadMore = vi.fn()
		component = mount(BoardHistoryLog, {
			target: document.body,
			props: {
				data: [
					{ timestamp: '2025-03-02T10:00:00Z', href: '/f/abc/history/2025-03-02T10:00:00Z' },
					{ timestamp: '2025-03-01T10:00:00Z' },
				],
				hasMore: true,
				onLoadMore,
			},
		})
		flushSync()
		const links = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'))
		expect(links).toEqual([
			'/f/abc/history/2025-03-02T10:00:00Z',
			'/f/abc/history/2025-03-01T10:00:00Z',
		])
		document.querySelector<HTMLButtonElement>('.board-history__load-more-button')!.click()
		expect(onLoadMore).toHaveBeenCalled()
	})
})
