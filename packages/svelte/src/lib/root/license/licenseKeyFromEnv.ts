import { getEnv } from '../env'

let envLicenseKey: string | undefined | null = undefined

/** @internal */
export function getLicenseKeyFromEnv(): string | null {
	if (envLicenseKey !== undefined) {
		return envLicenseKey
	}
	// it's important here that we write out the full process.env.WHATEVER expression instead of
	// doing something like process.env[someVariable]. This is because most bundlers do something
	// like a find-replace inject environment variables, and so won't pick up on dynamic ones. It
	// also means we can't do checks like `process.env && process.env.WHATEVER`, which is why we use
	// the `getEnv` try/catch approach.

	// framework-specific prefixes borrowed from the ones vercel uses, but trimmed down to just the
	// react-y ones: https://vercel.com/docs/environment-variables/framework-environment-variables
	envLicenseKey =
		getEnv(() => process.env.TLDRAW_LICENSE_KEY) ||
		getEnv(() => process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) ||
		getEnv(() => process.env.REACT_APP_TLDRAW_LICENSE_KEY) ||
		getEnv(() => process.env.GATSBY_TLDRAW_LICENSE_KEY) ||
		getEnv(() => process.env.VITE_TLDRAW_LICENSE_KEY) ||
		getEnv(() => process.env.PUBLIC_TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.REACT_APP_TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.GATSBY_TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.VITE_TLDRAW_LICENSE_KEY) ||
		getEnv(() => (import.meta as any).env.PUBLIC_TLDRAW_LICENSE_KEY) ||
		null

	return envLicenseKey
}
