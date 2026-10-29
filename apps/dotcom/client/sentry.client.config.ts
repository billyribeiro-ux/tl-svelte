// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/browser'
import { ExtraErrorData } from '@sentry/integrations'
import { THUMBNAIL_RENDER_PATH } from '@svelte-draw/dotcom-shared'
import { getErrorAnnotations } from '@svelte-draw/utils'
import type { Editor } from 'svelte-draw'
import { sentryReleaseName } from './sentry-release-name'
import { env } from './src/utils/env'
import { setGlobalErrorReporter } from './src/utils/errorReporting'

function requireSentryDsn() {
	if (!process.env.SENTRY_DSN) {
		throw new Error('SENTRY_DSN is required')
	}
	return process.env.SENTRY_DSN as string
}

// The thumbnail render page is deliberately absent of everything the app boots (Sentry, Clerk, the
// router providers): a capture pays for its load on every render, and none of it can appear in the
// pixels. SvelteKit runs hooks.client.ts for every route, so the opt-out is here.
const isThumbnailRender = window.location.pathname === THUMBNAIL_RENDER_PATH

if (!isThumbnailRender) {
	Sentry.init({
		dsn: env === 'development' ? undefined : requireSentryDsn(),
		// Adjust this value in production, or use tracesSampler for greater control
		tracesSampleRate: 1.0,
		release: sentryReleaseName,
		environment: env,
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		integrations: [new ExtraErrorData({ depth: 10 }) as any],
		// ...
		// Note: if you want to override the automatic release value, do not set a
		// `release` value here - use the environment variable `SENTRY_RELEASE`, so
		// that it will also get attached to your source maps

		beforeSend: (event, hint) => {
			if (env === 'development') {
				console.error('[SentryDev]', hint.originalException ?? hint.syntheticException)
				return null
			}
			// todo: re-evaulate use of window here?
			const editor: Editor | undefined = (window as any).editor
			const appErrorAnnotations = editor?.createErrorAnnotations('unknown', 'unknown')
			const errorAnnotations = getErrorAnnotations(hint.originalException as any)

			event.tags = {
				...appErrorAnnotations?.tags,
				...errorAnnotations.tags,
				...event.tags,
			}

			event.extra = {
				...appErrorAnnotations?.extras,
				...errorAnnotations.extras,
				...event.extra,
			}

			return event
		},
	})

	setGlobalErrorReporter((error) => Sentry.captureException(error))
}
