<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import DynamicToolbar from './DynamicToolbar.svelte'
	import SharePanelContent from './SharePanelContent.svelte'

	const LICENSE_KEY = import.meta.env.VITE_TLDRAW_LICENSE_KEY as string

	const SAVE_DEBOUNCE_MS = 500
	const ERROR_BANNER_HEIGHT = 30

	const svelteDrawComponents: TLComponents = {
		SharePanel: SharePanelContent,
		Toolbar: DynamicToolbar,
	}

	function parseHostTheme(value: unknown): 'light' | 'dark' | null {
		return value === 'dark' || value === 'light' ? value : null
	}
</script>

<script lang="ts">
	import type { App, McpUiDisplayMode } from '@modelcontextprotocol/ext-apps'
	import { onMount, untrack } from 'svelte'
	import {
		SvelteDraw,
		type Editor,
		type TLAsset,
		type TLBindingCreate,
		type TLShapeId,
		type TLUiEventHandler,
	} from 'svelte-draw'
	import svelteDrawLogoUrl from '../../plugins/svelte-draw-mcp/assets/logo.svg'
	import { computeExecKey } from '../shared/exec-key'
	import { primeEmbeddedMethodMap } from '../shared/generated-data'
	import { resolveMcpAppHostNameFromClientInfo } from '../shared/utils'
	import { setMcpAppContext } from './app-context'
	import { createDevLog, DEV_LOG_PANEL_HEIGHT } from './dev-log.svelte'
	import DevLogPanel from './DevLogPanel.svelte'
	import { executeCode } from './exec-helpers'
	import ImageDropGuard from './ImageDropGuard.svelte'
	import { uiOverrides } from './image-guard'
	import {
		type CanvasSnapshot,
		getCurrentCanvasId,
		getEmbeddedBootstrap,
		getLatestCheckpointSnapshot,
		loadLocalSnapshot,
		parseCheckpointFromToolResult,
		clearCanvasContext,
		pushCanvasContext,
		saveCheckpointToServer,
		saveLocalSnapshot,
		setCurrentCanvasId,
		setCurrentSessionId,
		syncEditorState,
	} from './persistence'
	import { applySnapshot, zoomToFitRequestShapes } from './snapshot'

	// McpApp.svelte connects the app once and never replaces it, so it is read once (as the React
	// effects that depended on `app` ran once).
	let props: { app: App } = $props()
	const app = untrack(() => props.app)

	let displayMode = $state<Extract<McpUiDisplayMode, 'inline' | 'fullscreen'>>('inline')
	let containerHeight = $state<number | null>(null)
	let lastEditor = $state<'user' | 'ai'>('ai')
	let hostContext = $state.raw(app.getHostContext())
	let canvasTheme = $state<'light' | 'dark'>(
		parseHostTheme((app.getHostContext() as { theme?: string } | undefined)?.theme) ?? 'light'
	)
	let execError = $state<string | null>(null)

	// Plain (non-reactive) bookkeeping: these were React refs.
	let editorRef: Editor | null = null
	let pendingSnapshot: CanvasSnapshot | null = null
	let committedSnapshot: CanvasSnapshot = { shapes: [], assets: [] }
	let checkpointId: string | null = null
	let removeStoreListener: (() => void) | null = null
	let editorReadyResolve: ((editor: Editor) => void) | null = null
	let editorReadyPromise: Promise<Editor> | null = null
	let saveTimer: number | null = null
	let lastEditorRef: 'user' | 'ai' = 'ai'
	let execPartialDebounce: number | null = null
	let hasExecRun = false

	const devLog = createDevLog()
	const logIfDevMode = devLog.logIfDevMode

	const hostCapabilities = app.getHostCapabilities()
	const hostInfo = app.getHostVersion()

	const isMobilePlatform = $derived(hostContext?.platform === 'mobile')
	const isDarkTheme = $derived(canvasTheme === 'dark')

	// The host name is resolved once from the client info the host sent during the handshake.
	const hostName = resolveMcpAppHostNameFromClientInfo(hostInfo?.name ?? '') ?? null

	function syncThemeFromEditor() {
		const editor = editorRef
		if (!editor) return
		canvasTheme = editor.user.getIsDarkMode() ? 'dark' : 'light'
	}

	function applyHostThemeToEditor(theme: 'light' | 'dark') {
		canvasTheme = theme
		const editor = editorRef
		if (!editor) return
		editor.user.updateUserPreferences({ colorScheme: theme })
	}

	const handleUiEvent: TLUiEventHandler = (name) => {
		const eventName = name as string
		if (eventName !== 'toggle-dark-mode' && eventName !== 'color-scheme') return
		queueMicrotask(() => {
			syncThemeFromEditor()
		})
	}

	const canFullscreen = $derived.by(() => {
		if (isMobilePlatform) return false
		const modes = hostContext?.availableDisplayModes
		if (!modes) return false
		return modes.includes('fullscreen')
	})

	const canDownload = !!hostCapabilities?.downloadFile

	const devLogPanelHeight = $derived(
		devLog.isDev && devLog.isDevLogVisible ? DEV_LOG_PANEL_HEIGHT : 0
	)

	function teardownEditor() {
		removeStoreListener?.()
		removeStoreListener = null
		if (saveTimer !== null) {
			window.clearTimeout(saveTimer)
			saveTimer = null
		}
		if (execPartialDebounce !== null) {
			window.clearTimeout(execPartialDebounce)
			execPartialDebounce = null
		}
		editorRef?.dispose()
		editorRef = null
	}

	function markAiActivity() {
		if (lastEditorRef !== 'ai') {
			lastEditorRef = 'ai'
			lastEditor = 'ai'
		}
	}

	function markUserEdit() {
		if (lastEditorRef !== 'user') {
			lastEditorRef = 'user'
			lastEditor = 'user'
		}
	}

	async function toggleFullscreen() {
		const newMode = displayMode === 'fullscreen' ? 'inline' : 'fullscreen'
		if (newMode === 'fullscreen' && (isMobilePlatform || !canFullscreen)) {
			return
		}

		if (newMode === 'inline') {
			const editor = editorRef
			if (editor) {
				committedSnapshot = syncEditorState(app, editor, checkpointId)
			}
		}

		try {
			const result = await app.requestDisplayMode({ mode: newMode })
			const actualMode = result.mode === 'fullscreen' ? 'fullscreen' : 'inline'
			displayMode = actualMode
		} catch {
			return
		}
	}

	setMcpAppContext({
		get displayMode() {
			return displayMode
		},
		toggleFullscreen,
		get canFullscreen() {
			return canFullscreen
		},
		canDownload,
		app,
		get lastEditor() {
			return lastEditor
		},
		hostName,
		get isDev() {
			return devLog.isDev
		},
		get isDevLogVisible() {
			return devLog.isDevLogVisible
		},
		toggleDevLog: devLog.toggleDevLog,
		logIfDevMode,
	})

	/** Returns the editor, waiting for mount if it hasn't happened yet. */
	function waitForEditor(): Promise<Editor> {
		const editor = editorRef
		if (editor) return Promise.resolve(editor)

		if (editorReadyPromise) return editorReadyPromise

		editorReadyPromise = new Promise<Editor>((resolve) => {
			editorReadyResolve = resolve
		})
		return editorReadyPromise
	}

	function scheduleSave() {
		if (saveTimer !== null) {
			window.clearTimeout(saveTimer)
		}
		saveTimer = window.setTimeout(() => {
			saveTimer = null
			const editor = editorRef
			if (!editor) return
			syncEditorState(app, editor, checkpointId)
		}, SAVE_DEBOUNCE_MS)
	}

	// Runs once, when the canvas mounts (the React original ran this effect once per `app`).
	onMount(() => {
		hostContext = app.getHostContext()
		const initialTheme = parseHostTheme(
			(app.getHostContext() as { theme?: string } | undefined)?.theme
		)
		if (initialTheme) {
			applyHostThemeToEditor(initialTheme)
		}

		logIfDevMode('Bootstrap loading...')
		const bootstrap = getEmbeddedBootstrap()
		primeEmbeddedMethodMap()

		// Delete the bootstrap data from the window object to prevent it from being used again.
		delete window.__SVELTE_DRAW_BOOTSTRAP__

		if (bootstrap) {
			setCurrentSessionId(bootstrap.sessionId)
			if (bootstrap.canvasId) {
				setCurrentCanvasId(bootstrap.canvasId)
			}
			if (bootstrap.isDev) {
				devLog.enableDevMode()
			}
			logIfDevMode(
				`Bootstrap loaded for session ${bootstrap.sessionId}, canvas ${bootstrap.canvasId ?? 'none'}${bootstrap.isDev ? ' (dev mode)' : ''}`
			)

			if (bootstrap.snapshot) {
				if (committedSnapshot.shapes.length === 0) {
					const snapshot: CanvasSnapshot = {
						shapes: bootstrap.snapshot.shapes,
						assets: bootstrap.snapshot.assets,
						bindings: bootstrap.snapshot.bindings,
					}
					committedSnapshot = snapshot
					if (bootstrap.checkpointId) {
						checkpointId = bootstrap.checkpointId
						logIfDevMode(
							`Restored embedded checkpoint ${bootstrap.checkpointId} with ${bootstrap.snapshot.shapes.length} shape(s)`
						)
					}
					const editor = editorRef
					if (editor) {
						applySnapshot(editor, snapshot)
					} else {
						pendingSnapshot = snapshot
					}
				}
			} else {
				const latestSnapshot = getLatestCheckpointSnapshot()
				if (latestSnapshot && committedSnapshot.shapes.length === 0) {
					logIfDevMode(
						`Restored latest local snapshot with ${latestSnapshot.shapes.length} shape(s)`
					)
					committedSnapshot = latestSnapshot
					const editor = editorRef
					if (editor) {
						applySnapshot(editor, latestSnapshot)
					} else {
						pendingSnapshot = latestSnapshot
					}
				}
			}
		}

		app.onhostcontextchanged = (ctx) => {
			const nextContext = app.getHostContext() ?? ctx
			hostContext = nextContext
			const nextTheme = parseHostTheme(
				(ctx as { theme?: string } | undefined)?.theme ??
					(nextContext as { theme?: string } | undefined)?.theme
			)
			if (nextTheme) {
				// Host theme changes take precedence over local preference changes.
				applyHostThemeToEditor(nextTheme)
			}

			const dims = ctx.containerDimensions
			if (dims && 'height' in dims) {
				containerHeight = dims.height
			}

			if (ctx.displayMode !== undefined) {
				const newMode = ctx.displayMode === 'fullscreen' ? 'fullscreen' : 'inline'

				if (newMode !== 'fullscreen') {
					const editor = editorRef
					if (editor) {
						committedSnapshot = syncEditorState(app, editor, checkpointId)
					}
				}

				displayMode = newMode
			}
		}

		const runExec = (code: string, source: string, canvasId?: string) => {
			if (hasExecRun) {
				logIfDevMode(`Exec: skipping duplicate exec from ${source}`)
				return
			}
			hasExecRun = true

			logIfDevMode(`Exec: running from ${source}`)
			markAiActivity()

			void (async () => {
				logIfDevMode('Exec: waiting for editor...')
				const editor = await waitForEditor()

				if (canvasId) {
					setCurrentCanvasId(canvasId)

					if (editor.getCurrentPageShapeIds().size === 0) {
						logIfDevMode(`Exec: canvas empty, fetching state for canvasId=${canvasId}`)
						try {
							const response = await app.callServerTool({
								name: '_get_canvas_state',
								arguments: { canvasId },
							})
							const res = response as any
							let data: any = null
							// Try structuredContent first, fall back to parsing text content
							if (res?.structuredContent) {
								data = res.structuredContent
							} else if (Array.isArray(res?.content)) {
								const textItem = res.content.find(
									(c: any) => c.type === 'text' && typeof c.text === 'string'
								)
								if (textItem) {
									try {
										data = JSON.parse(textItem.text)
									} catch {
										// not JSON
									}
								}
							}
							if (data && Array.isArray(data.shapes) && data.shapes.length > 0) {
								const snapshot: CanvasSnapshot = {
									shapes: data.shapes,
									assets: Array.isArray(data.assets) ? data.assets : [],
									bindings: Array.isArray(data.bindings) ? data.bindings : [],
								}
								applySnapshot(editor, snapshot)
								committedSnapshot = snapshot
								if (typeof data.checkpointId === 'string') {
									checkpointId = data.checkpointId
								}
								logIfDevMode(
									`Exec: restored ${data.shapes.length} shape(s) from server for canvasId=${canvasId}`
								)
							} else {
								logIfDevMode(`Exec: no shapes returned from server for canvasId=${canvasId}`)
							}
						} catch (err) {
							logIfDevMode(`Exec: failed to fetch canvas state: ${err}`)
						}
					}
				}

				logIfDevMode('Exec: editor ready, executing code')

				const execResult = await executeCode(editor, code)
				logIfDevMode(
					`Exec ${execResult.success ? 'succeeded' : 'failed'}: ${JSON.stringify(execResult.result ?? execResult.error)}`
				)

				// Resolve the waiting exec call. On same-session hosts this settles the
				// server's in-memory pending request directly; otherwise the server
				// forwards the result to the exec:<execKey> rendezvous DO, keyed by the
				// same (canvasId, code) pair both sides derive, so it still reaches the
				// waiting exec. `canvasId` here is the model-supplied input (undefined
				// for a new canvas) — the server keys on that same value, so folding it
				// in keeps same-code-different-canvas invocations from colliding.
				//
				// We also include the canvasId in the payload (when present) as a
				// belt-and-braces cross-check: the waiting exec rejects a delivered
				// result whose canvasId isn't the one it's editing. Omitted for new
				// canvases because the server-generated id isn't known here yet, and
				// sending a stale learned id would cause false mismatches.
				const execKey = await computeExecKey(code, canvasId)
				const resultPayload = execResult.success
					? { success: true, result: execResult.result }
					: { success: false, error: execResult.error }
				if (canvasId) {
					;(resultPayload as { canvasId?: string }).canvasId = canvasId
				}
				const callbackArgs = { channel: 'exec', execKey, result: resultPayload }
				try {
					await app.callServerTool({ name: '_exec_callback', arguments: callbackArgs })
					logIfDevMode('Exec: _exec_callback succeeded')
				} catch (err) {
					logIfDevMode(`Exec: _exec_callback failed: ${err}`)
				}

				if (execResult.success) {
					const cpId = checkpointId ?? crypto.randomUUID()
					checkpointId = cpId

					const resultStr =
						execResult.result !== undefined ? JSON.stringify(execResult.result, null, 2) : undefined
					committedSnapshot = syncEditorState(app, editor, cpId, {
						message: resultStr
							? `Code executed successfully on canvas. Return value:\n${resultStr}`
							: 'Code executed successfully on canvas.',
					})

					const snapshot = committedSnapshot
					const allShapeIds = new Set(snapshot.shapes.map((s) => s.id))
					zoomToFitRequestShapes(editor, allShapeIds)
				} else {
					clearCanvasContext(app, {
						message:
							'Canvas context was cleared because code execution failed. Fix the error before using the canvas context again.',
					})
					teardownEditor()
					execError = execResult.error ?? 'Unknown error'
					void app.sendSizeChanged({ width: 400, height: ERROR_BANNER_HEIGHT })
				}
			})()
		}

		app.ontoolinput = (params) => {
			logIfDevMode('Exec: ontoolinput called')
			const code = params.arguments?.code
			if (typeof code !== 'string' || !code.trim()) return
			const canvasId =
				typeof params.arguments?.canvasId === 'string' ? params.arguments.canvasId : undefined

			if (execPartialDebounce !== null) {
				window.clearTimeout(execPartialDebounce)
			}
			execPartialDebounce = window.setTimeout(() => {
				execPartialDebounce = null
				runExec(code, 'ontoolinput (debounced)', canvasId)
			}, 500)
		}

		app.ontoolinputpartial = (params) => {
			const code = params.arguments?.code
			if (typeof code !== 'string' || !code.trim()) return
			const canvasId =
				typeof params.arguments?.canvasId === 'string' ? params.arguments.canvasId : undefined

			if (execPartialDebounce !== null) {
				window.clearTimeout(execPartialDebounce)
			}
			execPartialDebounce = window.setTimeout(() => {
				execPartialDebounce = null
				runExec(code, 'ontoolinputpartial (debounced)', canvasId)
			}, 1000)
		}

		app.onteardown = async () => {
			return {}
		}

		app.ontoolresult = async (result) => {
			logIfDevMode('Exec: ontoolresult called')
			// If the code already ran for this invocation (via toolinput/partial), a
			// still-queued debounced run is a duplicate of it — cancel it before
			// resetting the run guard. If nothing ran yet (hosts that deliver input
			// and result together), keep the timer so the code still executes once.
			if (hasExecRun && execPartialDebounce !== null) {
				window.clearTimeout(execPartialDebounce)
				execPartialDebounce = null
			}
			hasExecRun = false
			markAiActivity()

			// The tool result carries the server-assigned canvasId on every host,
			// including those that route widget calls over a separate MCP session. Once
			// learned, persist the canvas -> checkpoint mapping so future execs can
			// restore this canvas.
			const sc = (result as { structuredContent?: { canvasId?: unknown } }).structuredContent
			if (sc && typeof sc.canvasId === 'string' && sc.canvasId) {
				const hadCanvasId = getCurrentCanvasId() !== null
				setCurrentCanvasId(sc.canvasId)
				logIfDevMode(`Exec: canvasId from tool result: ${sc.canvasId}`)
				if (!hadCanvasId) {
					const editor = editorRef
					const cpId = checkpointId
					if (editor && cpId) {
						void saveCheckpointToServer(app, cpId, editor)
					}
				}
			}

			const checkpoint = parseCheckpointFromToolResult(result)
			if (!checkpoint) return
			logIfDevMode(`Received tool result for checkpoint ${checkpoint.checkpointId}`)

			const {
				checkpointId: resultCheckpointId,
				sessionId,
				shapes: resultShapes,
				assets: resultAssets,
				bindings: resultBindings,
			} = checkpoint
			checkpointId = resultCheckpointId

			if (sessionId) {
				setCurrentSessionId(sessionId)
			}

			const localSnapshot = loadLocalSnapshot(resultCheckpointId)
			const finalShapes = localSnapshot ? localSnapshot.shapes : resultShapes
			const finalAssets: TLAsset[] = localSnapshot ? localSnapshot.assets : resultAssets
			const finalBindings: TLBindingCreate[] = localSnapshot
				? localSnapshot.bindings
				: resultBindings

			const previousCommittedIds = new Set(committedSnapshot.shapes.map((s) => s.id))

			const snapshot: CanvasSnapshot = {
				shapes: finalShapes,
				assets: finalAssets,
				bindings: finalBindings,
			}
			committedSnapshot = snapshot

			const editor = editorRef
			if (!editor) {
				pendingSnapshot = snapshot
				return
			}

			applySnapshot(editor, snapshot)

			if (!localSnapshot) {
				const newIds = new Set<TLShapeId>()
				for (const shape of finalShapes) {
					if (!previousCommittedIds.has(shape.id)) newIds.add(shape.id)
				}
				zoomToFitRequestShapes(editor, newIds)
			}

			saveLocalSnapshot(resultCheckpointId, finalShapes, finalAssets, finalBindings)
			void saveCheckpointToServer(app, resultCheckpointId, editor)
			pushCanvasContext(app, editor)
		}

		app.ontoolcancelled = (_params) => {
			hasExecRun = false
			if (execPartialDebounce !== null) {
				window.clearTimeout(execPartialDebounce)
				execPartialDebounce = null
			}
			markAiActivity()
			logIfDevMode('Tool invocation cancelled')
		}

		return () => {
			teardownEditor()
		}
	})

	$effect(() => {
		if (!isMobilePlatform || displayMode !== 'fullscreen') return

		void app
			.requestDisplayMode({ mode: 'inline' })
			.then((result) => {
				const actualMode = result.mode === 'fullscreen' ? 'fullscreen' : 'inline'
				displayMode = actualMode
			})
			.catch(() => {})
	})

	$effect(() => {
		if (displayMode === 'fullscreen' && containerHeight) {
			const h = `${containerHeight}px`
			document.documentElement.style.height = h
			document.body.style.height = h
		} else {
			document.documentElement.style.height = ''
			document.body.style.height = ''
		}
	})

	function handleMount(editor: Editor) {
		editorRef = editor
		editor.user.updateUserPreferences({ colorScheme: canvasTheme })

		if (editorReadyResolve) {
			editorReadyResolve(editor)
			editorReadyResolve = null
			editorReadyPromise = null
		}

		removeStoreListener?.()
		removeStoreListener = editor.store.listen(
			() => {
				markUserEdit()
				scheduleSave()
			},
			{ source: 'user', scope: 'document' }
		)

		editor.sideEffects.registerAfterChangeHandler('instance', (prev, next) => {
			const pb = prev.screenBounds
			const nb = next.screenBounds
			const dw = nb.w - pb.w
			const dh = nb.h - pb.h
			if (dw === 0 && dh === 0) return

			const cam = editor.getCamera()
			if (!Number.isFinite(cam.z) || cam.z <= 0) return
			const nextX = cam.x + dw / cam.z / 2
			const nextY = cam.y + dh / cam.z / 2
			if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return

			editor.setCamera({
				x: nextX,
				y: nextY,
				z: cam.z,
			})
		})

		const pending = pendingSnapshot
		if (pending) {
			pendingSnapshot = null
			applySnapshot(editor, pending)
		}

		pushCanvasContext(app, editor)
	}

	const isFullscreen = $derived(displayMode === 'fullscreen')
</script>

{#if execError}
	<div class="mcp-app__error-banner{isDarkTheme ? ' mcp-app__error-banner--dark' : ''}">
		<img
			src={svelteDrawLogoUrl}
			alt="svelte-draw logo"
			class="mcp-app__error-logo{isDarkTheme ? ' mcp-app__error-logo--dark' : ''}"
		/>
		<span class="mcp-app__error-label">Error editing canvas:</span>
		<span
			title={execError}
			class="mcp-app__error-message{isDarkTheme ? ' mcp-app__error-message--dark' : ''}"
		>
			{execError}
		</span>
	</div>
{:else}
	<div class="mcp-app__canvas-layout{isFullscreen ? ' mcp-app__canvas-layout--fullscreen' : ''}">
		<div
			class="mcp-app__canvas-surface{isFullscreen
				? ' mcp-app__canvas-surface--fullscreen'
				: ''}{devLogPanelHeight > 0 && !isFullscreen ? ' mcp-app__canvas-surface--with-dev-log' : ''}"
		>
			<SvelteDraw
				licenseKey={LICENSE_KEY}
				onMount={handleMount}
				onUiEvent={handleUiEvent}
				components={svelteDrawComponents}
				overrides={uiOverrides}
			>
				<ImageDropGuard />
			</SvelteDraw>
		</div>
		{#if devLog.isDev && devLog.isDevLogVisible}
			<DevLogPanel entries={devLog.devLogEntries} {isFullscreen} />
		{/if}
	</div>
{/if}
