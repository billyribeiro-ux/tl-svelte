import {
	PUBLISH_PREFIX,
	READ_ONLY_LEGACY_PREFIX,
	READ_ONLY_PREFIX,
	ROOM_PREFIX,
	SNAPSHOT_PREFIX,
} from '@svelte-draw/dotcom-shared'
import { fromComputed, getEditor, getTranslation } from 'svelte-draw'
import { location, params } from '../../../utils/router.svelte'

/**
 * Was `useGetFileName()`. Call during component initialisation; `.current` follows the document
 * name and the first page's name.
 */
export function getGetFileName(): { readonly current: string } {
	const editor = getEditor()
	const msg = getTranslation()
	const documentName = fromComputed('document name', () => editor.getDocumentSettings().name)
	const firstPageName = fromComputed('first page name', () => editor.getPages()[0].name)

	return {
		get current() {
			const defaultPageName = msg('page-menu.new-page-initial-name')

			const name = documentName.current
			if (name?.length > 0) return name

			const firstName = firstPageName.current
			if (
				firstName.length > 0 &&
				!firstName.startsWith('Page 1') &&
				!firstName.startsWith(defaultPageName)
			)
				return firstName
			return ''
		},
	}
}

function getPrefix() {
	const roomPrefix = location.pathname.split('/')[1]
	switch (roomPrefix) {
		case ROOM_PREFIX:
		case READ_ONLY_PREFIX:
		case READ_ONLY_LEGACY_PREFIX:
		case SNAPSHOT_PREFIX:
		case PUBLISH_PREFIX:
			return roomPrefix
	}
	return null
}

export interface RoomInfo {
	prefix: string
	id: string
}

/** Was `useRoomInfo()`. Safe to call anywhere; `.current` follows the route. */
export function getRoomInfo(): { readonly current: RoomInfo | null } {
	return {
		get current() {
			// Legacy routes name the param roomId; the publish route (/p/:fileSlug) names it fileSlug.
			const id = params.roomId ?? params.fileSlug
			const prefix = getPrefix()
			if (!id || !prefix) return null
			return { prefix, id }
		},
	}
}
