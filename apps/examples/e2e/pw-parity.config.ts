import base from './playwright.config'
export default {
	...base,
	webServer: undefined,
	testDir: './tests',
	use: {
		...base.use,
		video: 'off',
		launchOptions: {
			executablePath:
				process.env.PW_CHROMIUM ??
				`${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
		},
	},
}
