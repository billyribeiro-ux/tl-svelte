import type { Article } from '#types/content-types.js'

function getFileExtension(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? ''
	switch (ext) {
		case 'tsx':
		case 'ts':
			return 'tsx'
		case 'jsx':
		case 'js':
			return 'jsx'
		case 'css':
			return 'css'
		case 'svg':
			return 'xml'
		default:
			// includes 'svelte'
			return ext
	}
}

export function buildFullMarkdown(article: Article): string {
	const parts: string[] = []

	// Add the article content
	if (article.content) {
		parts.push(article.content.trim())
	}

	// Collect all code files
	const codeFiles: Array<{ name: string; content: string }> = []

	// Add the main component code
	if (article.componentCode && article.componentCodeFilename) {
		codeFiles.push({ name: article.componentCodeFilename, content: article.componentCode })
	}

	// Add additional code files
	if (article.componentCodeFiles) {
		const files = JSON.parse(article.componentCodeFiles) as Record<string, string>
		for (const [fileName, content] of Object.entries(files)) {
			codeFiles.push({ name: fileName, content })
		}
	}

	// Add all code files with filename comments
	for (const file of codeFiles) {
		const ext = getFileExtension(file.name)
		parts.push('\n\n```' + ext + '\n// ' + file.name + '\n\n' + file.content.trim() + '\n```')
	}

	return parts.join('')
}
