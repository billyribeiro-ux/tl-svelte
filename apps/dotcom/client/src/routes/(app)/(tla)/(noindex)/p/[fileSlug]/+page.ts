import { fetch, type SerializedSchema, type TLRecord } from 'svelte-draw'
import { PUBLISH_ENDPOINT } from '../../../../../../tla/app/SvelteDrawApp'
import { TlaNotFoundError } from '../../../../../../tla/utils/notFoundError'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
	const result = await fetch(`${PUBLISH_ENDPOINT}/${params.fileSlug}`)
	if (!result.ok) throw new TlaNotFoundError()

	const data = await result.json()
	if (!data || data.error) throw new TlaNotFoundError()
	return data as {
		roomId: string
		schema: SerializedSchema
		records: TLRecord[]
	}
}
