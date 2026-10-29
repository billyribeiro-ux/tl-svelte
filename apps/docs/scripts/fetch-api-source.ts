import { nicelog } from '#utils/nicelog.js'
import { fetchApiSource } from './lib/fetchApiSource'
;(async function () {
	nicelog('• Fetching API source files...')
	await fetchApiSource()
	nicelog('✔ Complete!')
	process.exit()
})()
