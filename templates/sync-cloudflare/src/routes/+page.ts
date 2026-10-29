import { redirect } from '@sveltejs/kit'
import { uniqueId } from 'svelte-draw'
import { getLocalStorageItem, setLocalStorageItem } from '#lib/localStorage.ts'

// The index route only forwards to this browser's own room (this app never renders on the server).
export function load() {
	const myLocalRoomId = getLocalStorageItem('my-local-room-id') ?? 'test-room-' + uniqueId()
	setLocalStorageItem('my-local-room-id', myLocalRoomId)
	redirect(307, `/${myLocalRoomId}`)
}
