import { createContext } from 'svelte'

export interface TlaMenuTabsContext {
	readonly activeTab: string
	onTabChange(tab: string): void
}

export const [getTabsContext, setTabsContext] = createContext<TlaMenuTabsContext>()
