import { nicelog } from '#utils/nicelog.js'
import { createApiMarkdown } from './lib/createApiMarkdown'
;(async function () {
	nicelog('• Generating markdown files for API docs...')
	await createApiMarkdown()
	nicelog('✔ Complete!')
	process.exit()
})()
