import { error } from '@sveltejs/kit'
import type { ArticlePageData, ExampleFile } from '#lib/page-data.js'
import { canonicalRouteForArticlePath, resolveContentPath } from '#lib/redirects.js'
import { buildFullMarkdown } from '#lib/server/article-markdown.js'
import { highlightFile } from '#lib/server/highlight.js'
import { compileMdx } from '#lib/server/mdx.js'
import { db } from '#utils/ContentDatabase.js'
import { parseMarkdown } from '#utils/parse-markdown.js'
import { canonicalDocsPageUrl } from '#utils/sitemap-canonical-paths.js'
import type { PageServerLoad } from './$types'

// `generateStaticParams` + `dynamicParams = false` in the Next app: every article in the content DB
// is prerendered, anything else is a 404. Articles that a rewrite serves at a canonical URL
// (/getting-started/quick-start -> /quick-start) are prerendered at that URL.
export const entries = async () => {
	const paths = await db.getAllPaths()
	return paths.map((path) => ({
		slug: canonicalRouteForArticlePath(path).replace(/^\//, ''),
	}))
}

export const load: PageServerLoad = async ({ params }): Promise<ArticlePageData> => {
	const pagePath = `/${params.slug}`
	const content = await db.getPageContent(resolveContentPath(pagePath))
	if (!content || content.type !== 'article') error(404, 'Not found')
	const { article } = content

	let description = article.description
	if (!description) {
		const parsed = parseMarkdown(article.content ?? '', article.id)
		description = parsed.initialContentText.trim() || null
	}

	// Examples and starter kits render their description as MDX above the content.
	const descriptionTree =
		(article.sectionId === 'examples' || article.sectionId === 'starter-kits') &&
		article.description
			? await compileMdx(article.description, `${article.id} (description)`)
			: null

	let example: ArticlePageData['example'] = null
	if (article.sectionId === 'examples') {
		// both are null when the README has no `component:` frontmatter
		const additionalFiles: Record<string, string> = article.componentCodeFiles
			? JSON.parse(article.componentCodeFiles)
			: {}
		const sources = [
			...(article.componentCode
				? [{ name: article.componentCodeFilename ?? 'App.svelte', content: article.componentCode }]
				: []),
			...Object.entries(additionalFiles).map(([name, content]) => ({ name, content })),
		]
		const files: ExampleFile[] = await Promise.all(
			sources.map(async ({ name, content }) => ({
				name,
				content,
				html: await highlightFile(name, content),
			}))
		)
		// article.id is in format "sectionId/categoryId/articleId", we need just the articleId
		example = { slug: article.id.split('/').pop()!, files }
	}

	return {
		article: {
			id: article.id,
			title: article.title,
			description: article.description,
			path: article.path,
			sectionId: article.sectionId,
			categoryId: article.categoryId,
			groupId: article.groupId,
			sourceUrl: article.sourceUrl,
			date: article.date,
			githubLink: article.githubLink,
			embed: article.embed,
		},
		markdown: buildFullMarkdown(article),
		descriptionTree,
		contentTree: await compileMdx(article.content ?? '', article.id),
		headings: await db.getArticleHeadings(article.id),
		links: await db.getArticleLinks(article),
		example,
		seo: {
			title: `${article.title} • svelte-draw Docs`,
			description,
			canonical: canonicalDocsPageUrl(pagePath),
		},
	}
}
