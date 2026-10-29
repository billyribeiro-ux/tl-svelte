import {
	type BaseRecord,
	type CustomRecordInfo,
	type RecordId,
	T,
	createCustomRecordId,
	createCustomRecordMigrationIds,
	createCustomRecordMigrationSequence,
} from 'svelte-draw'

// [1]
export const MARKER_TYPE = 'marker'
export interface Marker extends BaseRecord<typeof MARKER_TYPE, RecordId<Marker>> {
	x: number
	y: number
	label: string
	icon: string
}

declare module 'svelte-draw' {
	interface TLGlobalRecordPropsMap {
		[MARKER_TYPE]: Marker
	}
}

// [2]
const markerVersions = createCustomRecordMigrationIds(MARKER_TYPE, {
	AddIcon: 1,
})

// [3]
export const markerRecord: CustomRecordInfo = {
	scope: 'document',
	validator: T.object({
		id: T.string,
		typeName: T.literal(MARKER_TYPE),
		x: T.number,
		y: T.number,
		label: T.string,
		icon: T.string,
	}),
	migrations: createCustomRecordMigrationSequence({
		sequence: [
			{
				id: markerVersions.AddIcon,
				up: (record) => {
					record.icon = '📍'
				},
				down: (record) => {
					delete record.icon
				},
			},
		],
	}),
	createDefaultProperties: () => ({
		x: 0,
		y: 0,
		label: '',
		icon: '📍',
	}),
}

// [4]
export function createMarkerId(id?: string) {
	return createCustomRecordId(MARKER_TYPE, id) as Marker['id']
}

export const ICONS = ['📍', '⭐', '🏠', '🏢', '🎯', '⚠️']
