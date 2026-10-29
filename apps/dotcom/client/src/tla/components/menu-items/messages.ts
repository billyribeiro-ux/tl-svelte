import { defineMessages } from 'svelte-draw'

// One shared set so every message of the old `menu-items.tsx` still reaches the extracted catalog,
// including the ones nothing renders any more (accountMenu, about, terms, privacy, cookiePolicy).
export const messages = defineMessages({
	help: { defaultMessage: 'Help' },
	// user menu
	accountMenu: { defaultMessage: 'User settings' },
	signOut: { defaultMessage: 'Sign out' },
	importFile: { defaultMessage: 'Import file…' },
	// account menu
	getHelp: { defaultMessage: 'User manual' },
	legalSummary: { defaultMessage: 'Legal summary' },
	terms: { defaultMessage: 'Terms of service' },
	privacy: { defaultMessage: 'Privacy policy' },
	cookiePolicy: { defaultMessage: 'Cookie policy' },
	manageCookies: { defaultMessage: 'Manage cookies' },
	about: { defaultMessage: 'About svelte-draw' },
	submitFeedback: { defaultMessage: 'Send feedback' },
	// color theme
	colorTheme: { defaultMessage: 'Color theme' },
	colorThemeDefault: { defaultMessage: 'Default' },
	// debug
	appDebugFlags: { defaultMessage: 'App debug flags' },
	langHighlightMissing: { defaultMessage: 'i18n: Highlight Missing' },
})
