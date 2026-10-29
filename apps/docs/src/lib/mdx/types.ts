/**
 * The serialisable tree an MDX article is compiled to on the server (`$lib/server/mdx.ts`) and
 * rendered by `MdxNodes.svelte` in the browser and during prerendering. It plays the part
 * `next-mdx-remote` played for the React site: the MDX is parsed once at build time and the page
 * maps element names and JSX component names onto components.
 */
export type MdxAttributeValue = string | number | boolean

export interface MdxTextNode {
	t: 'text'
	v: string
}

/** A plain HTML (or SVG) element, with attributes already in their HTML spelling (`class`, `for`). */
export interface MdxElementNode {
	t: 'el'
	n: string
	a?: Record<string, MdxAttributeValue>
	c?: MdxNode[]
}

/** A capitalised JSX component such as `<Callout type="warning">`, with its evaluated props. */
export interface MdxComponentNode {
	t: 'cmp'
	n: string
	p?: Record<string, unknown>
	c?: MdxNode[]
}

export type MdxNode = MdxTextNode | MdxElementNode | MdxComponentNode
