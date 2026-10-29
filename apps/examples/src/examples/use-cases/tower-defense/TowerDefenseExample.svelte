<script lang="ts">
	import {
		Box,
		SvelteDraw,
		defaultOverlayUtils,
		type Editor,
		type TLAnyOverlayUtilConstructor,
		type TLUiComponents,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { resetSpawnTimer } from './game-loop'
	import { resetGameState } from './game-state'
	import GameRunner from './GameRunner.svelte'
	import GameToolbar from './GameToolbar.svelte'
	import HUD from './HUD.svelte'
	import { EnemyOverlayUtil } from './overlays/EnemyOverlayUtil'
	import { ExplosionOverlayUtil } from './overlays/ExplosionOverlayUtil'
	import { PathOverlayUtil } from './overlays/PathOverlayUtil'
	import { PlacementPreviewOverlayUtil } from './overlays/PlacementPreviewOverlayUtil'
	import { ProjectileOverlayUtil } from './overlays/ProjectileOverlayUtil'
	import { TowerRangeOverlayUtil } from './overlays/TowerRangeOverlayUtil'
	import { UpgradeButtonOverlayUtil } from './overlays/UpgradeButtonOverlayUtil'
	import './tower-defense.css'

	const overlayUtils: TLAnyOverlayUtilConstructor[] = [
		...defaultOverlayUtils,
		PathOverlayUtil,
		TowerRangeOverlayUtil,
		PlacementPreviewOverlayUtil,
		EnemyOverlayUtil,
		ProjectileOverlayUtil,
		ExplosionOverlayUtil,
		UpgradeButtonOverlayUtil,
	]

	const components: Required<TLUiComponents> = {
		TopPanel: HUD,
		Toolbar: GameToolbar,
		ContextMenu: null,
		ActionsMenu: null,
		HelpMenu: null,
		ZoomMenu: null,
		MainMenu: null,
		Minimap: null,
		StylePanel: null,
		PageMenu: null,
		NavigationPanel: null,
		KeyboardShortcutsDialog: null,
		QuickActions: null,
		HelperButtons: null,
		DebugPanel: null,
		DebugMenu: null,
		SharePanel: null,
		MenuPanel: null,
		CursorChatBubble: null,
		RichTextToolbar: null,
		ImageToolbar: null,
		VideoToolbar: null,
		Dialogs: null,
		Toasts: null,
		A11y: null,
		FollowingIndicator: null,
		PeopleMenu: null,
		PeopleMenuAvatar: null,
		PeopleMenuItem: null,
		PeopleMenuFacePile: null,
		UserPresenceEditor: null,
	}

	function onEditorMount(editor: Editor) {
		resetGameState()
		resetSpawnTimer()
		editor.zoomToBounds(new Box(-300, 0, 1700, 700), { immediate: true })
	}

	// Rapid clicks on enemies would otherwise create text shapes on double-click
	const svelteDrawOptions = { createTextOnCanvasDoubleClick: false }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{overlayUtils}
		{components}
		options={svelteDrawOptions}
		onMount={onEditorMount}
	>
		<GameRunner />
	</SvelteDraw>
</div>
