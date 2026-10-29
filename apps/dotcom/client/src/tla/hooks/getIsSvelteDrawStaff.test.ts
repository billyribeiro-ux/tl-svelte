import type { UserResource } from '@clerk/shared/types'
import { describe, expect, it } from 'vitest'
import { getIsSvelteDrawStaff } from './useUser.svelte'

function userWith(email: string | undefined, status: string | undefined): UserResource {
	return {
		primaryEmailAddress: email
			? {
					emailAddress: email,
					verification: status ? { status } : undefined,
				}
			: null,
	} as unknown as UserResource
}

describe('getIsSvelteDrawStaff', () => {
	it('is false for null/undefined users', () => {
		expect(getIsSvelteDrawStaff(null)).toBe(false)
		expect(getIsSvelteDrawStaff(undefined)).toBe(false)
	})

	it('is true for a verified @svelte-draw.invalid email', () => {
		expect(getIsSvelteDrawStaff(userWith('jane@svelte-draw.invalid', 'verified'))).toBe(true)
	})

	it('is false for a verified non-svelte-draw email', () => {
		expect(getIsSvelteDrawStaff(userWith('jane@gmail.com', 'verified'))).toBe(false)
	})

	it('is false for an unverified @svelte-draw.invalid email', () => {
		expect(getIsSvelteDrawStaff(userWith('jane@svelte-draw.invalid', 'unverified'))).toBe(false)
	})

	it('is false (not throwing) when verification is missing', () => {
		expect(getIsSvelteDrawStaff(userWith('jane@svelte-draw.invalid', undefined))).toBe(false)
	})

	it('is false when there is no primary email', () => {
		expect(getIsSvelteDrawStaff(userWith(undefined, undefined))).toBe(false)
	})
})
