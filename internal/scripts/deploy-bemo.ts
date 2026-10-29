import assert from 'assert'
import { readFileSync } from 'fs'
import path, { join } from 'path'
import toml from 'toml'
import {
	createGithubDeployment,
	getDeployInfo,
	setWranglerPreviewConfig,
	wranglerDeploy,
} from './lib/deploy'
import { Discord } from './lib/discord'
import { REPO_ROOT } from './lib/file'
import { makeEnv } from './lib/makeEnv'
import { nicelog } from './lib/nicelog'

const workerDir = path.relative(process.cwd(), path.resolve(REPO_ROOT, './apps/bemo-worker'))

// Do not use `process.env` directly in this script. Add your variable to `makeEnv` and use it via
// `env` instead. This makes sure that all required env vars are present.
const env = makeEnv([
	'CLOUDFLARE_ACCOUNT_ID',
	'CLOUDFLARE_API_TOKEN',
	'DISCORD_DEPLOY_WEBHOOK_URL',
	'RELEASE_COMMIT_HASH',
	'SVELTE_DRAW_ENV',
	'GH_TOKEN',
	'SENTRY_AUTH_TOKEN',
	'SENTRY_BEMO_WORKER_DSN',
])

const discord = new Discord({
	webhookUrl: env.DISCORD_DEPLOY_WEBHOOK_URL,
	shouldNotify: env.SVELTE_DRAW_ENV === 'production',
	totalSteps: 3,
	secretValues: Object.values(env),
})

const { previewId, sha } = getDeployInfo()

async function main() {
	assert(
		env.SVELTE_DRAW_ENV === 'staging' || env.SVELTE_DRAW_ENV === 'production' || env.SVELTE_DRAW_ENV === 'preview',
		'SVELTE_DRAW_ENV must be staging or production or preview'
	)

	await discord.message(`--- **${env.SVELTE_DRAW_ENV} bemo deploy pre-flight** ---`)

	await discord.step('cloudflare deploy dry run', async () => {
		await deployBemoWorker({ dryRun: true })
	})

	// --- point of no return! do the deploy for real --- //

	await discord.message(`--- **pre-flight complete, starting real bemo deploy** ---`)

	// 2. deploy the cloudflare workers:
	await discord.step('deploying bemo-worker to cloudflare', async () => {
		await deployBemoWorker({ dryRun: false })
	})

	// the deploy hostname comes from the env's route pattern in wrangler.toml
	const routePattern = toml.parse(readFileSync(join(workerDir, 'wrangler.toml')).toString())?.env[
		env.SVELTE_DRAW_ENV
	]?.routes?.[0]?.pattern
	if (!routePattern) {
		throw new Error('Could not find the route pattern in wrangler.toml')
	}

	// preview route patterns carry a path glob ("host/*"); the deployment URL wants just the host
	const deploymentUrl = `https://${routePattern.split('/')[0]}`

	nicelog('Creating deployment for', deploymentUrl)
	await createGithubDeployment(env, {
		app: 'bemo',
		deploymentUrl,
		sha,
	})

	await discord.message(`**Deploy complete!**`)
}

let didUpdateBemoWorker = false
async function deployBemoWorker({ dryRun }: { dryRun: boolean }) {
	const workerId = `${previewId ?? env.SVELTE_DRAW_ENV}-bemo`
	if (previewId && !didUpdateBemoWorker) {
		await setWranglerPreviewConfig(workerDir, {
			name: workerId,
			routeHostname: `${previewId}-demo.svelte-draw.invalid`,
		})
		didUpdateBemoWorker = true
	}

	await wranglerDeploy({
		location: workerDir,
		dryRun,
		env: env.SVELTE_DRAW_ENV,
		vars: {
			WORKER_NAME: workerId,
			SVELTE_DRAW_ENV: env.SVELTE_DRAW_ENV,
			SENTRY_DSN: env.SENTRY_BEMO_WORKER_DSN,
		},
		sentry: {
			authToken: env.SENTRY_AUTH_TOKEN,
			project: 'bemo-worker',
		},
	})
}

main().catch(async (err) => {
	// don't notify discord on preview builds
	if (env.SVELTE_DRAW_ENV !== 'preview') {
		await discord.message(`${Discord.AT_TEAM_MENTION} Deploy failed: ${err.stack}`, {
			always: true,
		})
	}
	console.error(err)
	process.exit(1)
})
