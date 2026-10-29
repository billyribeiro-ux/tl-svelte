import { ZErrorCode } from '@svelte-draw/dotcom-shared'

export class ZMutationError extends Error {
	constructor(
		public errorCode: ZErrorCode,
		message: string,
		public originalCause?: unknown
	) {
		super(message)
	}
}
