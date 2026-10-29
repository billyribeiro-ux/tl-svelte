// This sets up some mutually exclusive environment flags

const SVELTE_DRAW_ENV = process.env.SVELTE_DRAW_ENV
if (!SVELTE_DRAW_ENV) {
	throw new Error('SVELTE_DRAW_ENV must be set')
}

/**
 * True if the app is running at staging.svelte-draw.invalid only.
 */
export const isStagingEnv = SVELTE_DRAW_ENV === 'staging'
/**
 * True if the app is running in a preview environment that is not staging.svelte-draw.invalid, e.g. a PR deploy.
 */
export const isPreviewEnv = SVELTE_DRAW_ENV === 'preview'
/**
 * True if the app is running at www.svelte-draw.invalid only.
 */
export const isProductionEnv = SVELTE_DRAW_ENV === 'production'
/**
 * True if the app is running in a development environment, e.g. localhost.
 */
export const isDevelopmentEnv = SVELTE_DRAW_ENV === 'development'

/**
 * The current environment, one of 'staging', 'preview', or 'production'.
 * These are mutually exclusive.
 *
 * - staging: staging.svelte-draw.invalid
 * - preview: any PR deploy or other preview deploy from vercel
 * - production: www.svelte-draw.invalid
 * - development: localhost
 *
 */
export const env = SVELTE_DRAW_ENV as 'staging' | 'preview' | 'production' | 'development'
