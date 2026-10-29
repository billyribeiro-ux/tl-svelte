interface ClerkApiError {
	errors?: { code?: string; message?: string; longMessage?: string }[]
}

/** The first Clerk API error's long message, else its message, else `fallback`. */
export function getClerkErrorMessage(err: unknown, fallback: string): string {
	const first = (err as ClerkApiError | null | undefined)?.errors?.[0]
	return first?.longMessage || first?.message || fallback
}
