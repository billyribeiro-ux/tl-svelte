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
export interface CustomUserMeta {
	isAdmin: boolean
	department: string
}

export function asCustomMeta(user: TLUser | null): CustomUserMeta | null {
	if (!user) return null
	return user.meta as unknown as CustomUserMeta
}

// [2]
export const usersAtom = atom<Record<string, TLUser>>('users', {
	[createUserId('alice')]: UserRecordType.create({
		id: createUserId('alice'),
		name: 'Alice',
		color: '#e03131',
		meta: { isAdmin: true, department: 'Engineering' },
	}),
	[createUserId('bob')]: UserRecordType.create({
		id: createUserId('bob'),
		name: 'Bob',
		color: '#1971c2',
		meta: { isAdmin: false, department: 'Design' },
	}),
	[createUserId('carol')]: UserRecordType.create({
		id: createUserId('carol'),
		name: 'Carol',
		color: '#2f9e44',
		meta: { isAdmin: false, department: 'Product' },
	}),
})

export const currentUserIdAtom = atom('currentUserId', createUserId('alice'))

// [3]
const currentUserSignal = computed('currentUser', () => {
	return usersAtom.get()[currentUserIdAtom.get()] ?? null
})

export const users: TLUserStore = {
	currentUser: currentUserSignal,
	resolve: createCachedUserResolve((userId) => usersAtom.get()[createUserId(userId)] ?? null),
}
