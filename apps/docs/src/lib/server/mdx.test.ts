import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import type { MdxNode } from '../mdx/types'
import { compileMdx } from './mdx'

function findAll(nodes: MdxNode[], predicate: (node: MdxNode) => boolean): MdxNode[] {
	const found: MdxNode[] = []
	for (const node of nodes) {
		if (predicate(node)) found.push(node)
		if ('c' in node && node.c) found.push(...findAll(node.c, predicate))
	}
	return found
}

describe('compileMdx', () => {
	it('compiles markdown into plain element nodes with HTML attribute names', async () => {
		const tree = await compileMdx('# Hello\n\nSome [link](/quick-start) text', 'test')
		const heading = tree.find((n) => n.t === 'el' && n.n === 'h1')
		expect(heading).toMatchObject({ t: 'el', n: 'h1', a: { id: 'Hello' } })
		const link = findAll(tree, (n) => n.t === 'el' && n.n === 'a')[0]
		expect(link).toMatchObject({ a: { href: '/quick-start' } })
	})

	it('keeps JSX components and evaluates expression props', async () => {
		const tree = await compileMdx(
			'<Callout type="warning">Careful</Callout>\n\n<ApiMemberTitle inherited={{ name: "A", link: "/a" }} tags={["x"]} large>T</ApiMemberTitle>',
			'test'
		)
		expect(findAll(tree, (n) => n.t === 'cmp' && n.n === 'Callout')[0]).toMatchObject({
			p: { type: 'warning' },
		})
		expect(findAll(tree, (n) => n.t === 'cmp' && n.n === 'ApiMemberTitle')[0]).toMatchObject({
			p: { inherited: { name: 'A', link: '/a' }, tags: ['x'], large: true },
		})
	})

	it('maps JSX attribute names on lowercase tags to HTML', async () => {
		const tree = await compileMdx(
			'<details className="article__table-of-contents">x</details>',
			'test'
		)
		expect(findAll(tree, (n) => n.t === 'el' && n.n === 'details')[0]).toMatchObject({
			a: { class: 'article__table-of-contents' },
		})
	})

	it('highlights fenced code with shiki line spans', async () => {
		const tree = await compileMdx('```ts\nconst a = 1\n```', 'test')
		const lines = findAll(tree, (n) => n.t === 'el' && n.n === 'span' && n.a?.class === 'line')
		expect(lines.length).toBe(1)
	})

	it('fails loudly on unknown components and ESM statements', async () => {
		await expect(compileMdx('<Nope />', 'test')).rejects.toThrow(/unknown component <Nope>/)
		await expect(compileMdx("import x from 'y'\n\nhi", 'test')).rejects.toThrow(/not supported/)
	})

	it('drops MDX comments', async () => {
		const tree = await compileMdx('{/* hidden */}\n\nshown', 'test')
		expect(JSON.stringify(tree)).not.toContain('hidden')
	})
})

// Compiles every article of a locally generated content.db (`pnpm refresh-content`); skipped when absent.
const dbPath = path.join(process.cwd(), 'content.db')
describe.skipIf(!fs.existsSync(dbPath))('compileMdx over the generated content database', () => {
	it('compiles every article', async () => {
		const { connect } = await import('../../../scripts/lib/connect')
		const db = await connect({ mode: 'readonly' })
		const rows = await db.all<{ path: string; content: string; description: string | null }[]>(
			'SELECT path, content, description FROM articles'
		)
		expect(rows.length).toBeGreaterThan(0)
		for (const row of rows) {
			await compileMdx(row.content ?? '', row.path)
			if (row.description) await compileMdx(row.description, row.path)
		}
	}, 600_000)
})
