import shikiRehype from '@shikijs/rehype'
// `hast` is a types-only module provided by @types/hast.
// oxlint-disable-next-line svelte-draw/no-undeclared-dependencies
import type { Element, ElementContent, Root, RootContent } from 'hast'
import { find, html, svg } from 'property-information'
import rehypeSlug from 'rehype-slug-custom-id'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { MDX_COMPONENT_NAMES } from '../mdx/known-components'
import type { MdxAttributeValue, MdxNode } from '../mdx/types'

// Same pipeline `<Content>` configured for next-mdx-remote (remark-gfm, rehype-slug-custom-id,
// @shikijs/rehype), ending at a hast tree instead of React elements.
const MDX_NODE_TYPES = [
	'mdxJsxFlowElement',
	'mdxJsxTextElement',
	'mdxFlowExpression',
	'mdxTextExpression',
	'mdxjsEsm',
] as const

const processor = unified()
	.use(remarkParse)
	.use(remarkMdx)
	.use(remarkGfm)
	.use(remarkRehype, { passThrough: [...MDX_NODE_TYPES] })
	.use(rehypeSlug, {
		enableCustomId: true,
		maintainCase: true,
		removeAccents: true,
	})
	.use(shikiRehype as any, {
		themes: {
			dark: 'github-dark-default',
			light: 'github-light-default',
		},
		defaultColor: false,
		// Without `langs` the plugin loads all ~300 bundled grammars (seconds and
		// >100MB per build worker / dev server). Anything not listed is still
		// loaded on demand thanks to `lazy`.
		langs: ['ts', 'tsx', 'bash', 'css', 'toml', 'html', 'svelte'],
		lazy: true,
	})

const KNOWN_COMPONENTS = new Set<string>(MDX_COMPONENT_NAMES)

// The mdast-util-mdx-jsx / mdast-util-mdx-expression node shapes, which are not in @types/hast.
interface MdxJsxAttribute {
	type: 'mdxJsxAttribute'
	name: string
	value: string | null | { type: 'mdxJsxAttributeValueExpression'; value: string }
}
interface MdxJsxExpressionAttribute {
	type: 'mdxJsxExpressionAttribute'
	value: string
}
interface MdxJsxElement {
	type: 'mdxJsxFlowElement' | 'mdxJsxTextElement'
	name: string | null
	attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[]
	children: RootContent[]
}
interface MdxExpression {
	type: 'mdxFlowExpression' | 'mdxTextExpression'
	value: string
}

/**
 * Compiles an MDX string to the tree `MdxNodes.svelte` renders. `debugContext` names the article in
 * error messages so a bad article fails the build with a pointer to it.
 */
export async function compileMdx(source: string, debugContext: string): Promise<MdxNode[]> {
	let tree: Root
	try {
		const parsed = processor.parse(source)
		tree = (await processor.run(parsed)) as Root
	} catch (e: any) {
		throw new Error(`Could not compile MDX (in ${debugContext}): ${e.message}`)
	}
	return convertChildren(tree.children, false, debugContext)
}

function convertChildren(
	children: (RootContent | ElementContent)[],
	inSvg: boolean,
	ctx: string
): MdxNode[] {
	const result: MdxNode[] = []
	for (const child of children) {
		const converted = convertNode(child, inSvg, ctx)
		if (converted) result.push(...converted)
	}
	return result
}

function convertNode(node: RootContent | ElementContent, inSvg: boolean, ctx: string): MdxNode[] {
	const type = node.type as string
	switch (type) {
		case 'text':
			return [{ t: 'text', v: (node as { value: string }).value }]
		case 'root':
			// @shikijs/rehype can leave a nested root where it replaced a `<pre>`.
			return convertChildren((node as unknown as Root).children, inSvg, ctx)
		case 'comment':
		case 'doctype':
			return []
		case 'element': {
			const element = node as Element
			const nowInSvg = inSvg || element.tagName === 'svg'
			const attrs = convertProperties(element.properties, nowInSvg)
			const c = convertChildren(
				element.children,
				nowInSvg && element.tagName !== 'foreignObject',
				ctx
			)
			return [elementNode(element.tagName, attrs, c)]
		}
		case 'mdxJsxFlowElement':
		case 'mdxJsxTextElement':
			return convertJsx(node as unknown as MdxJsxElement, inSvg, ctx)
		case 'mdxFlowExpression':
		case 'mdxTextExpression': {
			const expression = (node as unknown as MdxExpression).value.trim()
			// `{/* a comment */}` is the only expression that renders nothing; anything else is evaluated.
			if (/^\/\*[\s\S]*\*\/$/.test(expression) || expression === '') return []
			const value = evaluate(expression, ctx)
			if (value === null || value === undefined || typeof value === 'boolean') return []
			if (typeof value === 'string' || typeof value === 'number') {
				return [{ t: 'text', v: String(value) }]
			}
			throw new Error(`MDX expression {${expression}} (in ${ctx}) did not evaluate to text`)
		}
		case 'mdxjsEsm':
			throw new Error(
				`import/export statements are not supported in MDX content (in ${ctx}): ${(node as { value: string }).value}`
			)
		default:
			throw new Error(`Unknown MDX node type "${type}" (in ${ctx})`)
	}
}

function elementNode(n: string, a: Record<string, MdxAttributeValue>, c: MdxNode[]): MdxNode {
	return {
		t: 'el',
		n,
		...(Object.keys(a).length ? { a } : {}),
		...(c.length ? { c } : {}),
	}
}

/** hast properties -> HTML attributes (`className` -> `class`, arrays joined, booleans kept). */
function convertProperties(
	properties: Element['properties'],
	inSvg: boolean
): Record<string, MdxAttributeValue> {
	const attrs: Record<string, MdxAttributeValue> = {}
	for (const [key, value] of Object.entries(properties ?? {})) {
		if (value === undefined || value === null || value === false) continue
		const info = find(inSvg ? svg : html, key)
		if (Array.isArray(value)) {
			attrs[info.attribute] = value.join(info.commaSeparated ? ', ' : ' ')
		} else {
			attrs[info.attribute] = value as MdxAttributeValue
		}
	}
	return attrs
}

function evaluate(expression: string, ctx: string): unknown {
	try {
		// MDX expressions are authored in this repository's own content, and next-mdx-remote evaluated
		// them with full JS as well; this runs at build time in Node.
		return new Function(`"use strict"; return (${expression})`)()
	} catch (e: any) {
		throw new Error(`Could not evaluate MDX expression {${expression}} (in ${ctx}): ${e.message}`)
	}
}

function cssFromStyleObject(style: Record<string, unknown>): string {
	return Object.entries(style)
		.map(([key, value]) => {
			const prop = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
			return `${prop}: ${value}`
		})
		.join('; ')
}

function convertJsx(node: MdxJsxElement, inSvg: boolean, ctx: string): MdxNode[] {
	const { name } = node
	if (name === null) {
		// A fragment, `<>...</>`.
		return convertChildren(node.children, inSvg, ctx)
	}

	const isComponent = /^[A-Z]/.test(name) || name.includes('.')
	const values: Record<string, unknown> = {}
	for (const attribute of node.attributes) {
		if (attribute.type === 'mdxJsxExpressionAttribute') {
			throw new Error(`Spread attributes are not supported (<${name} {...}>, in ${ctx})`)
		}
		const { value } = attribute
		values[attribute.name] =
			value === null
				? true
				: typeof value === 'string'
					? value
					: evaluate(value.value, `${ctx}, <${name} ${attribute.name}>`)
	}

	if (isComponent) {
		if (!KNOWN_COMPONENTS.has(name)) {
			throw new Error(
				`MDX uses an unknown component <${name}> (in ${ctx}). Known components: ${MDX_COMPONENT_NAMES.join(', ')}`
			)
		}
		const c = convertChildren(node.children, inSvg, ctx)
		return [
			{
				t: 'cmp',
				n: name,
				...(Object.keys(values).length ? { p: values } : {}),
				...(c.length ? { c } : {}),
			},
		]
	}

	// A lowercase tag is a plain element written as JSX (`<details className="...">`).
	const nowInSvg = inSvg || name === 'svg'
	const attrs: Record<string, MdxAttributeValue> = {}
	for (const [key, value] of Object.entries(values)) {
		if (value === false || value === null || value === undefined) continue
		const attribute = find(nowInSvg ? svg : html, key).attribute
		if (key === 'style' && typeof value === 'object') {
			attrs.style = cssFromStyleObject(value as Record<string, unknown>)
		} else if (typeof value === 'object') {
			throw new Error(`Attribute ${key} of <${name}> must be a string (in ${ctx})`)
		} else {
			attrs[attribute] = value as MdxAttributeValue
		}
	}
	const c = convertChildren(node.children, nowInSvg && name !== 'foreignObject', ctx)
	return [elementNode(name, attrs, c)]
}
