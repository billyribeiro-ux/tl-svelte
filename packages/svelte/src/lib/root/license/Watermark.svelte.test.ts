import { LicenseManager } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SvelteDrawEditor from '../SvelteDrawEditor.svelte'
import StubCanvas from '../testing/StubCanvas.svelte'

let mockLicenseState = 'unlicensed'

vi.mock('./licenseManagerState.svelte', () => ({
	createLicenseManagerState: () => ({
		get current() {
			return mockLicenseState
		},
	}),
	createLicenseFeatureFlag: () => ({ current: false }),
}))

describe('Watermark', () => {
	let target: HTMLElement
	let component: ReturnType<typeof mount> | undefined

	beforeEach(() => {
		target = document.createElement('div')
		document.body.appendChild(target)
	})
	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		target.remove()
	})

	async function renderEditorAndGetWatermarkElement() {
		component = mount(SvelteDrawEditor, {
			target,
			props: { options: { maxFontsToLoadBeforeRender: 0 }, components: { Canvas: StubCanvas } },
		})
		flushSync()
		await vi.waitFor(() => {
			// the editor (and with it the layout and the watermark) is ready once the canvas has rendered
			expect(target.querySelector('[data-testid="stub-canvas"]')).not.toBeNull()
		})
		return target.querySelector(`.${LicenseManager.className}`)
	}

	it('Displays the watermark when the editor is unlicensed', async () => {
		mockLicenseState = 'unlicensed'
		expect(await renderEditorAndGetWatermarkElement()).not.toBeNull()
	})

	it('Displays the watermark when the editor is licensed with watermark', async () => {
		mockLicenseState = 'licensed-with-watermark'
		expect(await renderEditorAndGetWatermarkElement()).not.toBeNull()
	})

	it('Does not display the watermark when the editor is licensed', async () => {
		mockLicenseState = 'licensed'
		expect(await renderEditorAndGetWatermarkElement()).toBeNull()
	})
})
