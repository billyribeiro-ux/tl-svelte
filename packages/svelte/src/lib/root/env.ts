/**
 * Reads a build-time environment value. The full `process.env.WHATEVER` expression has to be
 * written out at each call site so that bundlers can find-and-replace it, which is why this takes
 * a callback and swallows the `ReferenceError` thrown when `process` doesn't exist.
 */
export function getEnv(cb: () => string | undefined): string | undefined {
	try {
		return cb()
	} catch {
		return undefined
	}
}

export function getNodeEnv(): string | undefined {
	return getEnv(() => process.env.NODE_ENV)
}
