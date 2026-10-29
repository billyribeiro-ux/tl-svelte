import { appendFileSync } from 'fs'
import { parse } from 'semver'
import { makeEnv } from './lib/makeEnv'
import {
	getLatestSvelteDrawVersionFromNpm,
	publish,
	publishProductionDocsAndExamplesAndBemo,
	setAllVersions,
} from './lib/publishing'
import { uploadStaticAssets } from './lib/upload-static-assets'

const env = makeEnv(['SVELTE_DRAW_VERSION_STRING'])

async function main() {
	const latestVersion = await getLatestSvelteDrawVersionFromNpm()
	const version = parse(env.SVELTE_DRAW_VERSION_STRING)
	if (!version) throw new Error('Invalid version')

	const isLatestVersion = version.compare(latestVersion) >= 0 && !version.prerelease.length
	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(process.env.GITHUB_OUTPUT, `is_latest_version=${isLatestVersion}\n`)
	}

	await setAllVersions(env.SVELTE_DRAW_VERSION_STRING)

	await uploadStaticAssets(env.SVELTE_DRAW_VERSION_STRING)

	await publish()

	if (isLatestVersion) {
		await publishProductionDocsAndExamplesAndBemo()
	}
}

main()
