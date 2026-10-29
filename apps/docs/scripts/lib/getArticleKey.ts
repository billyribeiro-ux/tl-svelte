import { type Article } from '#types/content-types.js'

export function getArticleKey(article: Article): string {
	return `${article.sectionId}/${article.categoryId ?? 'ucg'}/${article.id ?? 'index'}`
}
