import type { TlaUser } from '@svelte-draw/dotcom-shared'
import {
	atom,
	deleteFromLocalStorage,
	getFromLocalStorage,
	setInLocalStorage,
	fromComputed,
	transact,
} from 'svelte-draw'
import { globalEditor } from '../../utils/globalEditor'

const STORAGE_KEY = 'svelte-drawapp_session_3'

export interface SvelteDrawAppSessionState {
	createdAt: number
	/**
	 * don't use this to decide if the sidebar is open
	 * use `getIsSidebarOpen` or `isSidebarOpen` instead
	 */
	_sidebarToggle: boolean
	isSidebarOpenMobile: boolean
	auth?: {
		userId: string
	}
	shareMenuActiveTab: 'share' | 'export' | 'publish' | 'anon-share'
	sidebarActiveTab: 'recent' | 'groups' | 'shared' | 'drafts' | 'starred'
	theme: 'light' | 'dark'
	colorTheme: string
	colorThemeBackground?: string
	views: {
		[key: string]: {
			sort: 'recent' | 'newest' | 'oldest' | 'atoz' | 'ztoa'
			view: 'grid' | 'list'
			search: string
		}
	}
	flags: { [key: string]: boolean }
	exportSettings: Pick<
		TlaUser,
		'exportFormat' | 'exportTheme' | 'exportBackground' | 'exportPadding'
	>
	sidebarWidth?: number
	shouldShowWelcomeDialog?: boolean
	// The file this browser last synced to, keyed by account so a different sign-in on the same
	// browser never lands on someone else's board. Only a hint: Zero's file_state is authoritative.
	lastVisitedFile?: { userId: string; fileId: string }
}

const defaultSessionState: SvelteDrawAppSessionState = {
	createdAt: Date.now(),
	_sidebarToggle: true,
	isSidebarOpenMobile: false,
	shareMenuActiveTab: 'share',
	sidebarActiveTab: 'recent',
	theme: 'light',
	colorTheme: 'default',
	views: {},
	flags: {},
	exportSettings: {
		exportFormat: 'png',
		exportTheme: 'auto',
		exportBackground: true,
		exportPadding: false,
	},
	sidebarWidth: 260,
}

let prev: SvelteDrawAppSessionState = { ...defaultSessionState }

try {
	const stored = getFromLocalStorage(STORAGE_KEY)
	const prevStored = stored ? JSON.parse(stored) : null
	if (prevStored) {
		prev = {
			...prev,
			...(prevStored as SvelteDrawAppSessionState),
			// forced initial values
			createdAt: Date.now(),
			isSidebarOpenMobile: false,
			auth: undefined,
		}
	}
} catch {
	// noop
}

const localSessionState = atom<SvelteDrawAppSessionState>('session', prev)
const colorThemePreview = atom<string | null>('colorThemePreview', null)

export function getIsSidebarOpen() {
	return (
		localSessionState.get()._sidebarToggle &&
		globalEditor.get()?.getInstanceState().isFocusMode !== true
	)
}
/** Was `useIsSidebarOpen()`. */
export const isSidebarOpen = fromComputed('isSidebarOpen', getIsSidebarOpen)

export function getIsSidebarOpenMobile() {
	return localSessionState.get().isSidebarOpenMobile
}

/** Was `useIsSidebarOpenMobile()`. */
export const isSidebarOpenMobile = fromComputed('isSidebarOpenMobile', getIsSidebarOpenMobile)

export function getDefaultSessionState() {
	return {
		...defaultSessionState,
		createdAt: Date.now(),
	}
}

export function clearLocalSessionState() {
	return deleteFromLocalStorage(STORAGE_KEY)
}

// we use this to help remove flashbangs on signout/signin
export function resetLocalSessionStateButKeepTheme() {
	const { theme: currentTheme, colorTheme, colorThemeBackground } = getLocalSessionStateUnsafe()
	clearLocalSessionState()
	const newState: SvelteDrawAppSessionState = {
		...getDefaultSessionState(),
		theme: currentTheme,
		colorTheme: colorTheme ?? 'default',
		colorThemeBackground,
	}
	localSessionState.set(newState)
	setInLocalStorage(STORAGE_KEY, JSON.stringify(newState))
}

export function getLocalSessionStateUnsafe() {
	return localSessionState.__unsafe__getWithoutCapture()
}

export function getLocalSessionState() {
	return localSessionState.get()
}

export function getColorThemePreview() {
	return colorThemePreview.get()
}

export function setColorThemePreview(themeId: string | null) {
	colorThemePreview.set(themeId)
}

export function toggleSidebar(open: boolean = !getIsSidebarOpen()) {
	transact(() => {
		if (open) {
			globalEditor.get()?.updateInstanceState({ isFocusMode: false })
		}
		updateLocalSessionState(() => {
			return { _sidebarToggle: open }
		})
	})
}

export function toggleMobileSidebar(open: boolean = !getIsSidebarOpenMobile()) {
	updateLocalSessionState(() => {
		return { isSidebarOpenMobile: open }
	})
}

export function getLastVisitedFileId(userId: string): string | null {
	const cached = getLocalSessionStateUnsafe().lastVisitedFile
	return cached?.userId === userId ? cached.fileId : null
}

export function setLastVisitedFile(userId: string, fileId: string) {
	updateLocalSessionState(() => ({ lastVisitedFile: { userId, fileId } }))
}

export function clearLastVisitedFile() {
	updateLocalSessionState(() => ({ lastVisitedFile: undefined }))
}

export function updateLocalSessionState(
	fn: (state: SvelteDrawAppSessionState) => Partial<SvelteDrawAppSessionState>
) {
	localSessionState.update((state) => {
		return { ...state, ...fn(state) }
	})
	setInLocalStorage(STORAGE_KEY, JSON.stringify(localSessionState.get()))
}
