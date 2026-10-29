import { fetch, type SerializedSchema, type TLRecord } from 'svelte-draw'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
	const result = await fetch(`/api/snapshot/${params.roomId}`)
	if (!result.ok) throw new Error('Room not found')

	const data = await result.json()
	if (!data || data.error) throw new Error('Room not found')
	return data as {
		roomId: string
		schema: SerializedSchema
		records: TLRecord[]
	}
}
