import {
	atom,
	computed,
	createCachedUserResolve,
	createUserId,
	UserRecordType,
	type TLUser,
	type TLUserStore,
} from 'svelte-draw'

// [1]
export const USERS: Record<string, TLUser> = {
	[createUserId('alice')]: UserRecordType.create({
		id: createUserId('alice'),
		name: 'Alice',
		color: '#e03131',
	}),
	[createUserId('bob')]: UserRecordType.create({
		id: createUserId('bob'),
		name: 'Bob',
		color: '#1971c2',
	}),
	[createUserId('carol')]: UserRecordType.create({
		id: createUserId('carol'),
		name: 'Carol',
		color: '#2f9e44',
	}),
}

export const currentUserIdAtom = atom('currentUserId', createUserId('alice'))

const currentUserSignal = computed('currentUser', () => {
	return USERS[currentUserIdAtom.get()] ?? null
})

export const users: TLUserStore = {
	currentUser: currentUserSignal,
	resolve: createCachedUserResolve((userId) => USERS[createUserId(userId)] ?? null),
}
