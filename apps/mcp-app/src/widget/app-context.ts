import type { App, McpUiDisplayMode } from '@modelcontextprotocol/ext-apps'
import { createContext } from 'svelte'
import type { MCP_APP_HOST_NAMES } from '../shared/types'

/**
 * What the widget's share panel and toolbar need from the canvas host. The provider
 * (`SvelteDrawCanvas.svelte`) passes an object with getters over its `$state`, so reading a property
 * inside a template or `$derived` is reactive.
 */
export interface McpAppContextValue {
	readonly displayMode: McpUiDisplayMode
	readonly toggleFullscreen: (() => Promise<void>) | null
	readonly canFullscreen: boolean
	readonly canDownload: boolean
	readonly app: App | null
	readonly lastEditor: 'user' | 'ai'
	readonly hostName: MCP_APP_HOST_NAMES | null
	readonly isDev: boolean
	readonly isDevLogVisible: boolean
	readonly toggleDevLog: (() => void) | null
	readonly logIfDevMode: ((message: string) => void) | null
}

export const [getMcpAppContext, setMcpAppContext] = createContext<McpAppContextValue>()
