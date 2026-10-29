import type { ArticleHeading, ArticleLinks, ArticleMeta } from '#types/content-types.js'
import type { MdxNode } from './mdx/types'

/** A source file shown under an example, highlighted on the server (see `Example.svelte`). */
export interface ExampleFile {
	name: string
	/** The highlighted `<pre>` contents (shiki output), ready for `{@html}`. */
	html: string
	/** The raw source, for the copy button. */
	content: string
}

/** Data the server `load` of the docs catch-all route (`src/routes/(docs)/[...slug]`) returns. */
export interface ArticlePageData {
	article: ArticleMeta
	/** Full markdown (article + example sources) for the "Copy markdown" button. */
	markdown: string
	/** The article's compiled description (examples and starter kits render it as MDX). */
	descriptionTree: MdxNode[] | null
	contentTree: MdxNode[]
	headings: ArticleHeading[]
	links: ArticleLinks
	/** The example embedded in an `examples` article; null for every other section. */
	example: { slug: string; files: ExampleFile[] } | null
	/** Page `<title>` (already templated) and meta description. */
	seo: { title: string; description: string | null; canonical: string }
}
