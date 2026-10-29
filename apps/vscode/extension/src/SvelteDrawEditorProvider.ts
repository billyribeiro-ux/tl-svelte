import * as vscode from 'vscode'
// @ts-ignore
import type { VscodeMessage } from '../../messages'
import { DocumentChangeEventArgs, SvelteDrawDocument } from './SvelteDrawDocument'
import { SvelteDrawWebviewManager } from './SvelteDrawWebviewManager'
import { nicelog } from './utils'

export class SvelteDrawEditorProvider implements vscode.CustomEditorProvider<SvelteDrawDocument> {
	private static newTDFileId = 1
	private disposables: vscode.Disposable[] = []
	private static readonly viewType = 'svelte-draw.tldr'
	private webviewPanels: vscode.WebviewPanel[] = []

	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
		vscode.CustomDocumentEditEvent<SvelteDrawDocument>
	>()
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event

	constructor(private readonly context: vscode.ExtensionContext) {}

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		// Several commands exist only to prevent the default keyboard shortcuts
		const noopCmds = ['zoomIn', 'zoomOut', 'resetZoom', 'toggleDarkMode']
		noopCmds.forEach((name) =>
			context.subscriptions.push(vscode.commands.registerCommand(`svelte-draw.tldr.${name}`, () => null))
		)

		// Register the 'Create New File' command, which creates a temporary
		// .tldr file and opens it in the editor.
		context.subscriptions.push(
			vscode.commands.registerCommand(`svelte-draw.tldr.new`, () => {
				const id = this.newTDFileId++
				const name = id > 1 ? `New Document ${id}.tldr` : `New Document.tldr`

				const workspaceFolders = vscode.workspace.workspaceFolders
				const path = workspaceFolders ? workspaceFolders[0].uri : vscode.Uri.parse('')

				vscode.commands.executeCommand(
					'vscode.openWith',
					vscode.Uri.joinPath(path, name).with({ scheme: 'untitled' }),
					this.viewType
				)
			})
		)

		// Register our editor provider, indicating to VS Code that we can
		// handle files with the .tldr extension.
		return vscode.window.registerCustomEditorProvider(
			this.viewType,
			new SvelteDrawEditorProvider(context),
			{
				webviewOptions: {
					retainContextWhenHidden: true,
				},
				supportsMultipleEditorsPerDocument: true,
			}
		)
	}

	async openCustomDocument(
		uri: vscode.Uri,
		openContext: { backupId?: string },
		_token: vscode.CancellationToken
	): Promise<SvelteDrawDocument> {
		nicelog('openCustomDocument')

		const document: SvelteDrawDocument = await SvelteDrawDocument.create(uri, openContext.backupId)
		this.disposables.push(
			document.onDidChange((e) => {
				nicelog('onDidChange')

				// Tell VS Code that the document has been edited by the use.
				this._onDidChangeCustomDocument.fire({
					document,
					...e,
				})
			})
		)

		this.disposables.push(
			document.onDidChangeContent((e: DocumentChangeEventArgs) => {
				nicelog('onDidChange')

				this.webviewPanels.forEach((w: vscode.WebviewPanel) => {
					if (w.active) {
						if (e.reason === 'undo' || e.reason === 'redo') {
							w.webview.postMessage({
								type: `vscode:${e.reason}`,
							} as VscodeMessage)
						} else if (e.reason === 'revert') {
							w.webview.postMessage({
								type: `vscode:revert`,
								data: {
									fileContents: JSON.stringify(e.fileContents),
								},
							} as VscodeMessage)
						}
					}
				})
			})
		)

		document.onDidDispose(() => {
			nicelog('onDidDispose document in provider')
			this.disposables.forEach((d) => d.dispose())
		})

		return document
	}

	async resolveCustomEditor(
		document: SvelteDrawDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		nicelog('resolveCustomEditor')
		this.webviewPanels.push(webviewPanel)
		webviewPanel.onDidDispose(() => {
			this.webviewPanels = this.webviewPanels.filter((w) => w !== webviewPanel)
		})
		new SvelteDrawWebviewManager(this.context, document, webviewPanel)
	}

	public saveCustomDocument(
		document: SvelteDrawDocument,
		cancellation: vscode.CancellationToken
	): Thenable<void> {
		return document.save(cancellation)
	}

	public saveCustomDocumentAs(
		document: SvelteDrawDocument,
		destination: vscode.Uri,
		cancellation: vscode.CancellationToken
	): Thenable<void> {
		return document.saveAs(destination, cancellation)
	}

	public revertCustomDocument(
		document: SvelteDrawDocument,
		cancellation: vscode.CancellationToken
	): Thenable<void> {
		return document.revert(cancellation)
	}

	public backupCustomDocument(
		document: SvelteDrawDocument,
		context: vscode.CustomDocumentBackupContext,
		cancellation: vscode.CancellationToken
	): Thenable<vscode.CustomDocumentBackup> {
		return document.backup(context.destination, cancellation)
	}
}
