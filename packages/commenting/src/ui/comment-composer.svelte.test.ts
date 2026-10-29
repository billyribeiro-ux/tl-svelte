import { flushSync, mount, unmount } from 'svelte'
import { toRichText, type TLRichText } from 'svelte-draw'
import { describe, expect, it } from 'vitest'
import CommentComposer from './CommentComposer.svelte'

describe('CommentComposer controlled value', () => {
	// The parent drives the composer from onChange, and clears it to an empty doc after posting. The
	// editor emits an update for a programmatic reset, the parent feeds that value straight back,
	// and the sync must recognise it as the editor's own and stop — not loop.
	it('syncs a controlled reset into the editor without a feedback loop', () => {
		const changes: TLRichText[] = []
		const props = $state({
			author: { name: 'Ada' },
			placeholder: 'Add a comment…',
			value: toRichText('first'),
			onChange: (value: TLRichText) => {
				changes.push(value)
				props.value = value
			},
		})
		const target = document.createElement('div')
		document.body.appendChild(target)
		const component = mount(CommentComposer, { target, props })
		flushSync()

		const input = () => target.querySelector('.tlui-cmt-input[role="textbox"]')!
		expect(input().textContent).toBe('first')

		props.value = toRichText('second')
		flushSync()
		expect(input().textContent).toBe('second')
		expect(changes).toHaveLength(1)

		props.value = toRichText('')
		flushSync()
		expect(input().textContent).toBe('')
		expect(target.querySelector('.tlui-cmt-input__placeholder')).not.toBeNull()
		expect(changes).toHaveLength(2)

		unmount(component)
		target.remove()
	})
})
