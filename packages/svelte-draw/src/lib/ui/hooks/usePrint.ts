import { assert, tlenv, uniqueId } from '@svelte-draw/editor'
import { tryGetEditor } from '@svelte-draw/svelte'

/**
 * Returns a function that prints the selection, or else the current page. Call during component
 * initialisation. Replaces `usePrint`.
 *
 * @internal
 */
export function getPrint() {
	const editor = tryGetEditor()
	// Plain variables replace the React refs: they only remember the previous print surface so it
	// can be cleaned up on the next call.
	let prevPrintEl: HTMLDivElement | null = null
	let prevStyleEl: HTMLStyleElement | null = null

	return async function printSelectionOrPages() {
		assert(editor, 'getPrint: editor is required')
		const doc = editor.getContainerDocument()
		const win = editor.getContainerWindow()
		const el = doc.createElement('div')
		const style = doc.createElement('style')

		const clearElements = (printEl: HTMLDivElement | null, styleEl: HTMLStyleElement | null) => {
			if (printEl) printEl.innerHTML = ''
			if (styleEl && doc.head.contains(styleEl)) doc.head.removeChild(styleEl)
			if (printEl && doc.body.contains(printEl)) {
				doc.body.removeChild(printEl)
			}
		}

		// Always make sure we have a clean root element.
		clearElements(prevPrintEl, prevStyleEl)
		prevPrintEl = el
		prevStyleEl = style

		// Random because this isn't for end users
		const className = `tl-print-surface-${uniqueId()}`

		el.className = className
		// NOTE: Works in most envs except safari, needs further review
		const enableMargins = false
		// NOTE: Currently buggy needs further investigation
		const allowAllPages = false
		style.innerHTML = `
			.${className} {
				display: none;
			}

			.${className} svg {
				max-width: 100%;
				height: 100%;
				display: block;
			}

			@media print {				  
				html, body {
					min-height: 100%;
					height: 100%;
					margin: 0;
				}

				body {
					position: relative;
				}

				body > * {
					display: none;
				}

				.svelte-draw__editor {
					display: none;
				}

				.${className} {
					display: block !important;
					background: white;
					min-height: 100%;
					height: 100%;
					max-width: 100%;
				}

				.${className}__item {
					padding: 10mm;
					display: flex;
					min-height: 100%;
					flex-direction: column;
					page-break-after: always;
					position: relative;
					overflow: hidden;
					height: 100%;
				}

				.${className}__item__main {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					max-height: 100%;
				}

				.${className}__item__header {
					display: none;
				}

				.${className}__item__footer {
					display: none;
					text-align: right;
				}

				.${className}__item__footer__hide {
					display: none;
				}

				${
					!enableMargins
						? ''
						: `
					/**
					 * Note: Safari doesn't support removing the page margins to remove them all!
					 */
					@page {
						margin:0;
					}

					.${className} .${className}__item__header {
						display: block;
					}

					.${className} .${className}__item__footer {
						display: block;
					}
				`
				}
			}

		`

		const beforePrintHandler = () => {
			doc.head.appendChild(style)
			doc.body.appendChild(el)
		}

		const afterPrintHandler = () => {
			editor.once('tick', () => {
				clearElements(el, style)
			})
		}

		win.addEventListener('beforeprint', beforePrintHandler)
		win.addEventListener('afterprint', afterPrintHandler)

		function addPageToPrint(title: string, footer: string | null, svg: string) {
			try {
				el.innerHTML += `<div class="${className}__item">
        <div class="${className}__item__header">
          ${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
        <div class="${className}__item__main">
          ${svg}
        </div>
        <div class="${className}__item__footer ${className}__item__footer__${footer ? '' : 'hide'}">
          ${footer ?? ''}
        </div>
      </div>`
			} catch (e) {
				console.error(e)
			}
		}

		function triggerPrint() {
			if (tlenv.isChromeForIos) {
				beforePrintHandler()
				win.print()
			} else if (tlenv.isSafari) {
				beforePrintHandler()
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				doc.execCommand('print', false)
			} else {
				win.print()
			}
		}

		const selectedShapeIds = editor.getSelectedShapeIds()

		const svgOpts = {
			scale: 1,
			background: false,
			darkMode: false,
			preserveAspectRatio: 'xMidYMid meet',
		}

		if (selectedShapeIds.length > 0) {
			// Print the selected ids from the current page
			const pageName = editor.getCurrentPage().name
			const svgExport = await editor.getSvgString(selectedShapeIds, svgOpts)

			if (svgExport) {
				addPageToPrint(`svelte-draw — ${pageName}`, null, svgExport.svg)
				triggerPrint()
			}
		} else {
			if (allowAllPages) {
				// Print all pages
				const pages = editor.getPages()
				for (let i = 0; i < pages.length; i++) {
					const page = pages[i]
					const svgExport = await editor.getSvgString(
						editor.getSortedChildIdsForParent(page.id),
						svgOpts
					)
					if (svgExport) {
						addPageToPrint(`svelte-draw — ${page.name}`, `${i}/${pages.length}`, svgExport.svg)
					}
				}
				triggerPrint()
			} else {
				const page = editor.getCurrentPage()
				const svgExport = await editor.getSvgString(
					editor.getSortedChildIdsForParent(page.id),
					svgOpts
				)
				if (svgExport) {
					addPageToPrint(`svelte-draw — ${page.name}`, null, svgExport.svg)
					triggerPrint()
				}
			}
		}

		win.removeEventListener('beforeprint', beforePrintHandler)
		win.removeEventListener('afterprint', afterPrintHandler)
	}
}
