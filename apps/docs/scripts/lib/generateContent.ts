import fs from 'fs'
import path from 'path'
import { type GeneratedContent, type InputSection } from '#types/content-types.js'
import { generateSection } from './generateSection'

export async function generateContent() {
	const CONTENT_DIRECTORY = path.join(process.cwd(), 'content')
	const sections = JSON.parse(
		fs.readFileSync(path.join(CONTENT_DIRECTORY, 'sections.json'), 'utf8')
	) as InputSection[]

	const result: GeneratedContent = {
		articles: {},
		sections: [],
	}

	for (let i = 0; i < sections.length; i++) {
		if (sections[i].id === 'reference') continue
		result.sections.push(generateSection(sections[i], result.articles, i))
	}

	return result
}
