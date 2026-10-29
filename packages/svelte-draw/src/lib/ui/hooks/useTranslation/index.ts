export {
	EN_TRANSLATION,
	RTL_LANGUAGES,
	fetchTranslation,
	type TLUiTranslation,
} from './translations'
export type { TLUiTranslationKey } from './TLUiTranslationKey'
export {
	getCurrentTranslation,
	getDirection,
	getTranslation,
	setCurrentTranslation,
	TranslationState,
	tryGetCurrentTranslation,
	untranslated,
	type TLUiTranslationContextType,
	type TLUiTranslationProviderProps,
	type TLUiTranslationValues,
} from './useTranslation.svelte'
export { default as SvelteDrawUiTranslationProvider } from './SvelteDrawUiTranslationProvider.svelte'
