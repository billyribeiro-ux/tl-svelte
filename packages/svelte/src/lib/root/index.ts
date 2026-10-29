export { default as SvelteDrawEditor } from './SvelteDrawEditor.svelte'
export { default as DefaultErrorFallback } from './DefaultErrorFallback.svelte'
export { default as LoadingScreen } from './LoadingScreen.svelte'
export { default as ErrorScreen } from './ErrorScreen.svelte'
export { default as EditorProvider } from './EditorProvider.svelte'
export { default as LicenseProvider } from './license/LicenseProvider.svelte'
export { default as Watermark } from './license/Watermark.svelte'
export { TL_CONTAINER_CLASS } from './constants'
export { getDefaultEditorComponents } from './defaultComponents'
export { createManagedTLSchemaFromUtils, createManagedTLStore } from './createManagedStore.svelte'
export { createLocalStore, type LocalStoreOptions } from './createLocalStore.svelte'
export { createSvelteDrawCurrentUser } from './user.svelte'
export { createColorMode } from './colorMode.svelte'
export { setupDarkMode } from './darkMode.svelte'
export { getCursor, setupCursor } from './cursor.svelte'
export { setupOnMount } from './onMount.svelte'
export {
	deepObjectIdentity,
	shallowArrayIdentity,
	shallowObjectIdentity,
	stableValue,
	type StableValue,
} from './identity.svelte'
export {
	setEditorI18nFallback,
	tryGetEditorI18nFallback,
	type EditorI18nFallback,
} from './i18nFallback'
export { createErrorMsg, errorMessages } from './errorMessages'
export {
	LICENSE_TIMEOUT,
	getLicenseManager,
	getLicenseManagerAccessor,
	getMaybeLicenseManagerAccessor,
	setLicenseManager,
	tryGetLicenseManager,
} from './license/licenseContext'
export {
	createLicenseFeatureFlag,
	createLicenseManagerState,
} from './license/licenseManagerState.svelte'
export { getLicenseKeyFromEnv } from './license/licenseKeyFromEnv'
export type {
	LoadingScreenProps,
	SvelteDrawEditorBaseProps,
	SvelteDrawEditorProps,
	SvelteDrawEditorStoreProps,
	SvelteDrawEditorWithStoreProps,
	SvelteDrawEditorWithoutStoreProps,
	TLOnMountHandler,
} from './types'
