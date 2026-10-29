import { registerSvelteDrawLibraryVersion } from '@svelte-draw/editor'
// The SDK entry. Components are re-exported as default exports of their `.svelte` files under the
// names the React API used; `use*` hooks are exported under their new `get*` / `create*` / `setup*`
// names (the mapping table is in `lib/ui/context/index.ts` and `lib/ui/hooks/index.ts`).
// Importing the UI entry also registers the default UI components (see `lib/ui/index.ts`).
import './lib/ui/index'

// eslint-disable-next-line svelte-draw/no-export-star
export * from '@svelte-draw/editor'
// eslint-disable-next-line svelte-draw/no-export-star
export * from '@svelte-draw/svelte'
// Both packages export a `getCursor`; the editor's is the one the React API exposed.
export { getCursor } from '@svelte-draw/editor'
export { getPointsFromDrawSegment, getPointsFromDrawSegments } from './lib/shapes/draw/getPath'
export {
	PathBuilder,
	PathBuilderGeometry2d,
	type BasePathBuilderOpts,
	type CubicBezierToPathBuilderCommand,
	type DashedPathBuilderOpts,
	type DrawPathBuilderDOpts,
	type DrawPathBuilderOpts,
	type NonePathBuilderOpts,
	type LineToPathBuilderCommand,
	type MoveToPathBuilderCommand,
	type PathBuilderCommand,
	type PathBuilderCommandBase,
	type PathBuilderCommandInfo,
	type PathBuilderCommandOpts,
	type PathBuilderLineOpts,
	type PathBuilderOpts,
	type PathBuilderToDOpts,
	type SolidPathBuilderOpts,
} from './lib/shapes/shared/PathBuilder'
export { usePrefersReducedMotion } from './lib/shapes/shared/usePrefersReducedMotion.svelte'
export { startEditingShapeWithRichText } from './lib/tools/SelectTool/selectHelpers'
export { default as DefaultA11yAnnouncer } from './lib/ui/components/A11y.svelte'
export { setupSelectedShapesAnnouncer } from './lib/ui/components/a11yAnnouncements.svelte'
export { default as AccessibilityMenu } from './lib/ui/components/AccessibilityMenu.svelte'
export { default as ColorSchemeMenu } from './lib/ui/components/ColorSchemeMenu.svelte'
export { default as DefaultFollowingIndicator } from './lib/ui/components/DefaultFollowingIndicator.svelte'
export { default as DefaultDialogs } from './lib/ui/components/Dialogs.svelte'
export {
	SvelteDrawUiColumn,
	SvelteDrawUiGrid,
	SvelteDrawUiOrientationProvider,
	SvelteDrawUiRow,
	type TLUiLayoutProps,
	SvelteDrawUiMenuContextProvider,
	type TLUiMenuContextProviderProps,
	SvelteDrawUiDialogBody,
	SvelteDrawUiDialogCloseButton,
	SvelteDrawUiDialogFooter,
	SvelteDrawUiDialogHeader,
	SvelteDrawUiDialogTitle,
	type TLUiDialogBodyProps,
	type TLUiDialogFooterProps,
	type TLUiDialogHeaderProps,
	type TLUiDialogTitleProps,
	SvelteDrawUiDropdownMenuCheckboxItem,
	SvelteDrawUiDropdownMenuContent,
	SvelteDrawUiDropdownMenuGroup,
	SvelteDrawUiDropdownMenuIndicator,
	SvelteDrawUiDropdownMenuItem,
	SvelteDrawUiDropdownMenuRoot,
	SvelteDrawUiDropdownMenuSub,
	SvelteDrawUiDropdownMenuSubContent,
	SvelteDrawUiDropdownMenuSubTrigger,
	SvelteDrawUiDropdownMenuTrigger,
	type TLUiDropdownMenuCheckboxItemProps,
	type TLUiDropdownMenuContentProps,
	type TLUiDropdownMenuGroupProps,
	type TLUiDropdownMenuItemProps,
	type TLUiDropdownMenuRootProps,
	type TLUiDropdownMenuSubContentProps,
	type TLUiDropdownMenuSubProps,
	type TLUiDropdownMenuSubTriggerProps,
	type TLUiDropdownMenuTriggerProps,
	SvelteDrawUiPopoverContent,
	SvelteDrawUiPopoverTrigger,
	type TLUiPopoverContentProps,
	type TLUiPopoverTriggerProps,
	SvelteDrawUiSelectContent,
	SvelteDrawUiSelectItem,
	SvelteDrawUiSelectTrigger,
	SvelteDrawUiSelectValue,
	type TLUiSelectContentProps,
	type TLUiSelectItemProps,
	type TLUiSelectTriggerProps,
	type TLUiSelectValueProps,
	SvelteDrawUiToolbarButton,
	SvelteDrawUiToolbarToggleGroup,
	SvelteDrawUiToolbarToggleItem,
	type TLUiToolbarButtonProps,
	type TLUiToolbarToggleGroupProps,
	type TLUiToolbarToggleItemProps,
	hideAllTooltips,
	SvelteDrawUiTooltipProvider,
	type SvelteDrawUiTooltipProviderProps,
} from './lib/ui/components/primitives'
export {
	getSvelteDrawUiOrientation,
	type SvelteDrawUiOrientationContext,
} from './lib/ui/components/primitives/layout.svelte'
export {
	default as SvelteDrawUiMenuActionCheckboxItem,
	type TLUiMenuActionCheckboxItemProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuActionCheckboxItem.svelte'
export {
	default as SvelteDrawUiMenuActionItem,
	type TLUiMenuActionItemProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuActionItem.svelte'
export {
	default as SvelteDrawUiMenuToolItem,
	type TLUiMenuToolItemProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuToolItem.svelte'
export { default as DefaultToasts } from './lib/ui/components/Toasts.svelte'
export {
	F,
	SvelteDrawUiTranslationProvider,
	SvelteDrawUiA11yProvider,
	AssetUrlsProvider,
	BreakPointProvider,
	SvelteDrawUiComponentsProvider,
	SvelteDrawUiDialogsProvider,
	SvelteDrawUiEventsProvider,
	SvelteDrawUiToastsProvider,
} from './lib/ui/context'
export {
	getSvelteDrawI18n,
	type TLUiMessageProps,
	type TLUiMessageValues,
} from './lib/ui/context/i18n'
export { BookmarkAssetUtil } from './lib/assets/BookmarkAssetUtil'
export { ImageAssetUtil } from './lib/assets/ImageAssetUtil'
export { VideoAssetUtil } from './lib/assets/VideoAssetUtil'
export {
	ArrowBindingHintOverlayUtil,
	type TLArrowBindingHintOverlay,
} from './lib/overlays/ArrowBindingHintOverlayUtil'
export { ArrowBindingUtil } from './lib/bindings/arrow/ArrowBindingUtil'
export { ArrowHintOverlayUtil, type TLArrowHintOverlay } from './lib/overlays/ArrowHintOverlayUtil'
export {
	BrushOverlayUtil,
	type BrushOverlayUtilDisplayValues,
	type BrushOverlayUtilOptions,
	type TLBrushOverlay,
} from './lib/overlays/BrushOverlayUtil'
export { ZoomBrushOverlayUtil, type TLZoomBrushOverlay } from './lib/overlays/ZoomBrushOverlayUtil'
export { ScribbleOverlayUtil, type TLScribbleOverlay } from './lib/overlays/ScribbleOverlayUtil'
export {
	CollaboratorHintOverlayUtil,
	type TLCollaboratorHintOverlay,
} from './lib/overlays/CollaboratorHintOverlayUtil'
// Deprecated, but still exported so apps that customized canvas-drawn cursors keep working.
// oxlint-disable-next-line typescript/no-deprecated
export { CollaboratorCursorOverlayUtil } from './lib/overlays/CollaboratorCursorOverlayUtil'
export {
	CollaboratorBrushOverlayUtil,
	type TLCollaboratorBrushOverlay,
} from './lib/overlays/CollaboratorBrushOverlayUtil'
export {
	CollaboratorScribbleOverlayUtil,
	type TLCollaboratorScribbleOverlay,
} from './lib/overlays/CollaboratorScribbleOverlayUtil'
export {
	CollaboratorShapeIndicatorOverlayUtil,
	type TLCollaboratorShapeIndicatorOverlay,
} from './lib/overlays/CollaboratorShapeIndicatorOverlayUtil'
export {
	ShapeHandleOverlayUtil,
	type TLShapeHandleOverlay,
} from './lib/overlays/ShapeHandleOverlayUtil'
export {
	ShapeIndicatorOverlayUtil,
	type TLShapeIndicatorOverlay,
} from './lib/overlays/ShapeIndicatorOverlayUtil'
export {
	SelectionForegroundOverlayUtil,
	type TLSelectionForegroundOverlay,
} from './lib/overlays/SelectionForegroundOverlayUtil'
export {
	SnapIndicatorOverlayUtil,
	type TLSnapIndicatorOverlay,
} from './lib/overlays/SnapIndicatorOverlayUtil'
export { defaultAssetUtils } from './lib/defaultAssetUtils'
export { defaultBindingUtils } from './lib/defaultBindingUtils'
export { defaultOverlayUtils } from './lib/defaultOverlayUtils'
export {
	DEFAULT_EMBED_DEFINITIONS,
	embedShapePermissionDefaults,
	unknownEmbedShapePermissionOverrides,
	type CustomEmbedDefinition,
	type DefaultEmbedConfig,
	type DefaultEmbedDefinitionType,
	type EmbedDefinition,
	type GoogleMapsEmbedConfig,
	type TLEmbedDefinition,
	type TLEmbedShapePermissions,
} from './lib/defaultEmbedDefinitions'
export {
	centerSelectionAroundPoint,
	createEmptyBookmarkShape,
	createShapesForAssets,
	DEFAULT_MAX_ASSET_SIZE,
	DEFAULT_MAX_IMAGE_DIMENSION,
	defaultHandleExternalEmbedContent,
	defaultHandleExternalExcalidrawContent,
	defaultHandleExternalFileAsset,
	defaultHandleExternalFileContent,
	defaultHandleExternalFileReplaceContent,
	defaultHandleExternalSvgTextContent,
	defaultHandleExternalTextContent,
	defaultHandleExternalSvelteDrawContent,
	defaultHandleExternalUrlAsset,
	defaultHandleExternalUrlContent,
	getAssetInfo,
	notifyIfFileNotAllowed,
	registerDefaultExternalContentHandlers,
	type TLDefaultExternalContentHandlerOpts,
	type TLExternalContentProps,
} from './lib/defaultExternalContentHandlers'
export { defaultShapeTools } from './lib/defaultShapeTools'
export { defaultShapeUtils } from './lib/defaultShapeUtils'
export { registerDefaultSideEffects } from './lib/defaultSideEffects'
export { defaultTools } from './lib/defaultTools'
export {
	type ArrowShapeOptions,
	type ArrowShapeUtilDisplayValues,
	type TLArcArrowInfo,
	type TLArcInfo,
	type TLArrowInfo,
	type TLArrowPoint,
	type TLElbowArrowInfo,
	type TLStraightArrowInfo,
} from './lib/shapes/arrow/arrow-types'
export { ArrowShapeTool } from './lib/shapes/arrow/ArrowShapeTool'
export { ArrowShapeUtil } from './lib/shapes/arrow/ArrowShapeUtil'
export {
	clearArrowTargetState,
	getArrowTargetState,
	updateArrowTargetState,
	type ArrowTargetState,
	type UpdateArrowTargetStateOpts,
} from './lib/shapes/arrow/arrowTargetState'
export {
	type ElbowArrowBox,
	type ElbowArrowBoxEdges,
	type ElbowArrowBoxes,
	type ElbowArrowEdge,
	type ElbowArrowInfo,
	type ElbowArrowInfoWithoutRoute,
	type ElbowArrowMidpointHandle,
	type ElbowArrowOptions,
	type ElbowArrowRange,
	type ElbowArrowRoute,
	type ElbowArrowSide,
	type ElbowArrowSideReason,
	type ElbowArrowTargetBox,
} from './lib/shapes/arrow/elbow/definitions'
export { getArrowInfo } from './lib/shapes/arrow/getArrowInfo'
export {
	getArrowBindings,
	getArrowTerminalsInArrowSpace,
	type TLArrowBindings,
} from './lib/shapes/arrow/shared'
export { createBookmarkFromUrl } from './lib/shapes/bookmark/bookmarks'
export {
	BookmarkShapeUtil,
	type BookmarkShapeOptions,
	type BookmarkShapeUtilDisplayValues,
} from './lib/shapes/bookmark/BookmarkShapeUtil'
export { DrawShapeTool } from './lib/shapes/draw/DrawShapeTool'
export {
	DrawShapeUtil,
	type DrawShapeOptions,
	type DrawShapeUtilDisplayValues,
} from './lib/shapes/draw/DrawShapeUtil'
export {
	EmbedShapeUtil,
	type EmbedShapeOptions,
	type EmbedShapeUtilDisplayValues,
} from './lib/shapes/embed/EmbedShapeUtil'
export { FrameShapeTool } from './lib/shapes/frame/FrameShapeTool'
export {
	FrameShapeUtil,
	type FrameShapeOptions,
	type FrameShapeUtilDisplayValues,
} from './lib/shapes/frame/FrameShapeUtil'
export { GeoShapeTool } from './lib/shapes/geo/GeoShapeTool'
export {
	GeoShapeUtil,
	type GeoShapeOptions,
	type GeoShapeUtilDisplayValues,
} from './lib/shapes/geo/GeoShapeUtil'
export {
	defaultGeoTypeDefinitions,
	getGeoTypeDefinition,
	type GeoTypeDefinition,
} from './lib/shapes/geo/getGeoShapePath'
export { HighlightShapeTool } from './lib/shapes/highlight/HighlightShapeTool'
export {
	HighlightShapeUtil,
	type HighlightShapeOptions,
	type HighlightShapeUtilDisplayValues,
} from './lib/shapes/highlight/HighlightShapeUtil'
export {
	ImageShapeUtil,
	type ImageShapeOptions,
	type ImageShapeUtilDisplayValues,
} from './lib/shapes/image/ImageShapeUtil'
export { LineShapeTool } from './lib/shapes/line/LineShapeTool'
export {
	LineShapeUtil,
	type LineShapeOptions,
	type LineShapeUtilDisplayValues,
} from './lib/shapes/line/LineShapeUtil'
export {
	default as DefaultNoteShapeAttribution,
	type TLNoteShapeAttributionComponent,
	type TLNoteShapeAttributionProps,
} from './lib/shapes/note/DefaultNoteShapeAttribution.svelte'
export { NoteShapeTool } from './lib/shapes/note/NoteShapeTool'
export {
	NoteShapeUtil,
	type NoteShapeOptions,
	type NoteShapeUtilDisplayValues,
} from './lib/shapes/note/NoteShapeUtil'
export {
	ASPECT_RATIO_OPTIONS,
	ASPECT_RATIO_TO_VALUE,
	getCropBox,
	getDefaultCrop,
	getUncroppedSize,
	type ASPECT_RATIO_OPTION,
	type CropBoxOptions,
} from './lib/shapes/shared/crop'
export { getFontFamily } from './lib/shapes/shared/default-shape-constants'
export {
	allDefaultFontFaces,
	DefaultFontFaces,
	type TLDefaultFont,
	type TLDefaultFonts,
} from './lib/shapes/shared/defaultFonts'
export { getStroke } from './lib/shapes/shared/freehand/getStroke'
export { getStrokeOutlinePoints } from './lib/shapes/shared/freehand/getStrokeOutlinePoints'
export { getStrokePoints } from './lib/shapes/shared/freehand/getStrokePoints'
export { getSvgPathFromStrokePoints } from './lib/shapes/shared/freehand/svg'
export { type StrokeOptions, type StrokePoint } from './lib/shapes/shared/freehand/types'
export {
	getDisplayValues,
	type ShapeOptionsWithDisplayValues,
} from './lib/shapes/shared/getDisplayValues'
export {
	default as PlainTextLabel,
	type PlainTextLabelProps,
} from './lib/shapes/shared/PlainTextLabel.svelte'
export {
	default as RichTextLabel,
	type RichTextLabelProps,
} from './lib/shapes/shared/RichTextLabel.svelte'
export { default as RichTextSVG } from './lib/shapes/shared/RichTextSVG.svelte'
export { useEditablePlainText } from './lib/shapes/shared/useEditablePlainText.svelte'
export { useEditableRichText } from './lib/shapes/shared/useEditableRichText.svelte'
export {
	useImageOrVideoAsset,
	type UseImageOrVideoAssetOptions,
} from './lib/shapes/shared/useImageOrVideoAsset.svelte'
export { default as PlainTextArea } from './lib/shapes/text/PlainTextArea.svelte'
export { default as RichTextArea } from './lib/shapes/text/RichTextArea.svelte'
export { TextShapeTool } from './lib/shapes/text/TextShapeTool'
export {
	TextShapeUtil,
	type TextShapeOptions,
	type TextShapeUtilDisplayValues,
} from './lib/shapes/text/TextShapeUtil'
export {
	VideoShapeUtil,
	type VideoShapeOptions,
	type VideoShapeUtilDisplayValues,
} from './lib/shapes/video/VideoShapeUtil'
export { getColorStyleItems, getFontStyleItems, type StyleValuesForUi } from './lib/styles'
export {
	default as SvelteDraw,
	type TLComponents,
	type SvelteDrawBaseProps,
	type SvelteDrawProps,
} from './lib/SvelteDraw.svelte'
export { default as SvelteDrawImage, type SvelteDrawImageProps } from './lib/SvelteDrawImage.svelte'
export { EraserTool } from './lib/tools/EraserTool/EraserTool'
export { HandTool } from './lib/tools/HandTool/HandTool'
export { LaserTool } from './lib/tools/LaserTool/LaserTool'
export { getHitShapeOnCanvasPointerDown } from './lib/tools/selection-logic/getHitShapeOnCanvasPointerDown'
export { SelectTool } from './lib/tools/SelectTool/SelectTool'
export { ZoomTool } from './lib/tools/ZoomTool/ZoomTool'
export {
	setDefaultUiAssetUrls,
	type TLUiAssetUrlOverrides,
	type TLUiAssetUrls,
} from './lib/ui/assetUrls'
export {
	default as DefaultActionsMenu,
	type TLUiActionsMenuProps,
} from './lib/ui/components/ActionsMenu/DefaultActionsMenu.svelte'
export { default as AlignMenuItems } from './lib/ui/components/ActionsMenu/AlignMenuItems.svelte'
export { default as DefaultActionsMenuContent } from './lib/ui/components/ActionsMenu/DefaultActionsMenuContent.svelte'
export { default as DistributeMenuItems } from './lib/ui/components/ActionsMenu/DistributeMenuItems.svelte'
export { default as GroupOrUngroupMenuItem } from './lib/ui/components/ActionsMenu/GroupOrUngroupMenuItem.svelte'
export { default as ReorderMenuItems } from './lib/ui/components/ActionsMenu/ReorderMenuItems.svelte'
export { default as RotateCWMenuItem } from './lib/ui/components/ActionsMenu/RotateCWMenuItem.svelte'
export { default as StackMenuItems } from './lib/ui/components/ActionsMenu/StackMenuItems.svelte'
export { default as ZoomOrRotateMenuItem } from './lib/ui/components/ActionsMenu/ZoomOrRotateMenuItem.svelte'
export {
	default as ContextMenu,
	default as DefaultContextMenu,
	type TLUiContextMenuProps,
} from './lib/ui/components/ContextMenu/DefaultContextMenu.svelte'
export { default as DefaultContextMenuContent } from './lib/ui/components/ContextMenu/DefaultContextMenuContent.svelte'
export {
	default as DefaultDebugMenu,
	type TLUiDebugMenuProps,
} from './lib/ui/components/DebugMenu/DefaultDebugMenu.svelte'
export { default as DebugFlags } from './lib/ui/components/DebugMenu/DebugFlags.svelte'
export {
	default as DefaultDebugMenuContent,
	type CustomDebugFlags,
} from './lib/ui/components/DebugMenu/DefaultDebugMenuContent.svelte'
export { default as ExampleDialog } from './lib/ui/components/DebugMenu/ExampleDialog.svelte'
export { default as FeatureFlags } from './lib/ui/components/DebugMenu/FeatureFlags.svelte'
export { default as DefaultMenuPanel } from './lib/ui/components/DefaultMenuPanel.svelte'
export {
	default as DefaultHelperButtons,
	type TLUiHelperButtonsProps,
} from './lib/ui/components/HelperButtons/DefaultHelperButtons.svelte'
export { default as DefaultHelperButtonsContent } from './lib/ui/components/HelperButtons/DefaultHelperButtonsContent.svelte'
export {
	default as DefaultHelpMenu,
	type TLUiHelpMenuProps,
} from './lib/ui/components/HelpMenu/DefaultHelpMenu.svelte'
export { default as DefaultHelpMenuContent } from './lib/ui/components/HelpMenu/DefaultHelpMenuContent.svelte'
export { default as KeyboardShortcutsMenuItem } from './lib/ui/components/HelpMenu/KeyboardShortcutsMenuItem.svelte'
export {
	default as DefaultKeyboardShortcutsDialog,
	type TLUiKeyboardShortcutsDialogProps,
} from './lib/ui/components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialog.svelte'
export { default as DefaultKeyboardShortcutsDialogContent } from './lib/ui/components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialogContent.svelte'
export { default as LanguageMenu } from './lib/ui/components/LanguageMenu.svelte'
export { default as InputModeMenu } from './lib/ui/components/InputModeMenu.svelte'
export {
	default as DefaultMainMenu,
	type TLUiMainMenuProps,
} from './lib/ui/components/MainMenu/DefaultMainMenu.svelte'
export { default as DefaultMainMenuContent } from './lib/ui/components/MainMenu/DefaultMainMenuContent.svelte'
export { default as EditSubmenu } from './lib/ui/components/MainMenu/EditSubmenu.svelte'
export { default as ExportFileContentSubMenu } from './lib/ui/components/MainMenu/ExportFileContentSubMenu.svelte'
export { default as ExtrasGroup } from './lib/ui/components/MainMenu/ExtrasGroup.svelte'
export { default as LockGroup } from './lib/ui/components/MainMenu/LockGroup.svelte'
export { default as MiscMenuGroup } from './lib/ui/components/MainMenu/MiscMenuGroup.svelte'
export { default as PreferencesGroup } from './lib/ui/components/MainMenu/PreferencesGroup.svelte'
export { default as UndoRedoGroup } from './lib/ui/components/MainMenu/UndoRedoGroup.svelte'
export { default as ViewSubmenu } from './lib/ui/components/MainMenu/ViewSubmenu.svelte'
export {
	ArrangeMenuSubmenu,
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	ConvertToBookmarkMenuItem,
	ConvertToEmbedMenuItem,
	CopyAsMenuGroup,
	CopyMenuItem,
	CursorChatItem,
	CutMenuItem,
	DeleteMenuItem,
	DuplicateMenuItem,
	EditLinkMenuItem,
	EditMenuSubmenu,
	ExportAsMenuGroup,
	FitFrameToContentMenuItem,
	GroupMenuItem,
	MoveToPageMenu,
	PasteMenuItem,
	PrintItem,
	RemoveFrameMenuItem,
	ReorderMenuSubmenu,
	SelectAllMenuItem,
	ToggleAutoSizeMenuItem,
	ToggleDebugModeItem,
	ToggleDynamicSizeModeItem,
	ToggleEdgeScrollingItem,
	ToggleEnhancedA11yModeItem,
	ToggleFocusModeItem,
	ToggleGridItem,
	ToggleInvertZoomItem,
	ToggleKeyboardShortcutsItem,
	ToggleLockMenuItem,
	TogglePasteAtCursorItem,
	ToggleReduceMotionItem,
	ToggleSnapModeItem,
	ToggleToolLockItem,
	ToggleTransparentBgMenuItem,
	ToggleWrapModeItem,
	UngroupMenuItem,
	UnlockAllMenuItem,
	ZoomTo100MenuItem,
	ZoomToFitMenuItem,
	ZoomToSelectionMenuItem,
} from './lib/ui/components/menu-items'
export { default as DefaultMinimap } from './lib/ui/components/Minimap/DefaultMinimap.svelte'
export { default as MobileStylePanel } from './lib/ui/components/MobileStylePanel.svelte'
export { default as DefaultNavigationPanel } from './lib/ui/components/NavigationPanel/DefaultNavigationPanel.svelte'
export { default as OfflineIndicator } from './lib/ui/components/OfflineIndicator/OfflineIndicator.svelte'
export { default as DefaultPageMenu } from './lib/ui/components/PageMenu/DefaultPageMenu.svelte'
export {
	default as PageItemInput,
	type PageItemInputProps,
} from './lib/ui/components/PageMenu/PageItemInput.svelte'
export {
	default as PageItemSubmenu,
	type PageItemSubmenuProps,
} from './lib/ui/components/PageMenu/PageItemSubmenu.svelte'
export {
	default as SvelteDrawUiButton,
	type TLUiButtonProps,
} from './lib/ui/components/primitives/Button/SvelteDrawUiButton.svelte'
export {
	default as SvelteDrawUiButtonCheck,
	type TLUiButtonCheckProps,
} from './lib/ui/components/primitives/Button/SvelteDrawUiButtonCheck.svelte'
export {
	default as SvelteDrawUiButtonIcon,
	type TLUiButtonIconProps,
} from './lib/ui/components/primitives/Button/SvelteDrawUiButtonIcon.svelte'
export {
	default as SvelteDrawUiButtonLabel,
	type TLUiButtonLabelProps,
} from './lib/ui/components/primitives/Button/SvelteDrawUiButtonLabel.svelte'
export {
	default as SvelteDrawUiMenuCheckboxItem,
	type TLUiMenuCheckboxItemProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuCheckboxItem.svelte'
export { type TLUiMenuContextType } from './lib/ui/components/primitives/menus/SvelteDrawUiMenuContext'
export {
	default as SvelteDrawUiMenuGroup,
	type TLUiMenuGroupProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuGroup.svelte'
export {
	default as SvelteDrawUiMenuItem,
	type TLUiMenuItemProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuItem.svelte'
export {
	default as SvelteDrawUiMenuSubmenu,
	type TLUiMenuSubmenuProps,
} from './lib/ui/components/primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
export {
	default as SvelteDrawUiContextualToolbar,
	type TLUiContextualToolbarProps,
} from './lib/ui/components/primitives/SvelteDrawUiContextualToolbar.svelte'
export {
	default as SvelteDrawUiIcon,
	type TLUiIconJsx,
	type TLUiIconProps,
} from './lib/ui/components/primitives/SvelteDrawUiIcon.svelte'
export {
	default as SvelteDrawUiInput,
	type TLUiInputProps,
} from './lib/ui/components/primitives/SvelteDrawUiInput.svelte'
export {
	default as SvelteDrawUiKbd,
	type TLUiKbdProps,
} from './lib/ui/components/primitives/SvelteDrawUiKbd.svelte'
export {
	default as SvelteDrawUiPopover,
	type TLUiPopoverProps,
} from './lib/ui/components/primitives/SvelteDrawUiPopover.svelte'
export {
	default as SvelteDrawUiSelect,
	type TLUiSelectProps,
} from './lib/ui/components/primitives/SvelteDrawUiSelect.svelte'
export {
	default as SvelteDrawUiSlider,
	type TLUiSliderProps,
} from './lib/ui/components/primitives/SvelteDrawUiSlider.svelte'
export {
	default as SvelteDrawUiToolbar,
	type TLUiToolbarProps,
} from './lib/ui/components/primitives/SvelteDrawUiToolbar.svelte'
export {
	default as SvelteDrawUiTooltip,
	type SvelteDrawUiTooltipProps,
} from './lib/ui/components/primitives/SvelteDrawUiTooltip.svelte'
export {
	default as DefaultQuickActions,
	type TLUiQuickActionsProps,
} from './lib/ui/components/QuickActions/DefaultQuickActions.svelte'
export { default as DefaultQuickActionsContent } from './lib/ui/components/QuickActions/DefaultQuickActionsContent.svelte'
export {
	default as DefaultPeopleMenu,
	type DefaultPeopleMenuProps,
	type DefaultPeopleMenuProps as PeopleMenuProps,
} from './lib/ui/components/SharePanel/DefaultPeopleMenu.svelte'
export {
	default as DefaultPeopleMenuAvatar,
	type TLUiPeopleMenuAvatarProps,
} from './lib/ui/components/SharePanel/DefaultPeopleMenuAvatar.svelte'
export {
	default as DefaultPeopleMenuContent,
	type DefaultPeopleMenuContentProps,
} from './lib/ui/components/SharePanel/DefaultPeopleMenuContent.svelte'
export {
	default as DefaultPeopleMenuFacePile,
	type TLUiPeopleMenuFacePileProps,
} from './lib/ui/components/SharePanel/DefaultPeopleMenuFacePile.svelte'
export {
	default as DefaultPeopleMenuItem,
	type TLUiPeopleMenuItemProps,
} from './lib/ui/components/SharePanel/DefaultPeopleMenuItem.svelte'
export { default as DefaultSharePanel } from './lib/ui/components/SharePanel/DefaultSharePanel.svelte'
export { default as DefaultUserPresenceEditor } from './lib/ui/components/SharePanel/DefaultUserPresenceEditor.svelte'
export { default as Spinner } from './lib/ui/components/Spinner.svelte'
export {
	default as DefaultStylePanel,
	type TLUiStylePanelProps,
} from './lib/ui/components/StylePanel/DefaultStylePanel.svelte'
export { default as DefaultStylePanelContent } from './lib/ui/components/StylePanel/DefaultStylePanelContent.svelte'
export { default as StylePanelArrowheadPicker } from './lib/ui/components/StylePanel/StylePanelArrowheadPicker.svelte'
export { default as StylePanelArrowKindPicker } from './lib/ui/components/StylePanel/StylePanelArrowKindPicker.svelte'
export { default as StylePanelColorPicker } from './lib/ui/components/StylePanel/StylePanelColorPicker.svelte'
export { default as StylePanelDashPicker } from './lib/ui/components/StylePanel/StylePanelDashPicker.svelte'
export { default as StylePanelFillPicker } from './lib/ui/components/StylePanel/StylePanelFillPicker.svelte'
export { default as StylePanelFontPicker } from './lib/ui/components/StylePanel/StylePanelFontPicker.svelte'
export { default as StylePanelGeoShapePicker } from './lib/ui/components/StylePanel/StylePanelGeoShapePicker.svelte'
export { default as StylePanelLabelAlignPicker } from './lib/ui/components/StylePanel/StylePanelLabelAlignPicker.svelte'
export { default as StylePanelOpacityPicker } from './lib/ui/components/StylePanel/StylePanelOpacityPicker.svelte'
export { default as StylePanelSection } from './lib/ui/components/StylePanel/StylePanelSection.svelte'
export { default as StylePanelSizePicker } from './lib/ui/components/StylePanel/StylePanelSizePicker.svelte'
export { default as StylePanelSplinePicker } from './lib/ui/components/StylePanel/StylePanelSplinePicker.svelte'
export { default as StylePanelTextAlignPicker } from './lib/ui/components/StylePanel/StylePanelTextAlignPicker.svelte'
export {
	default as StylePanelButtonPicker,
	type StylePanelButtonPickerProps,
} from './lib/ui/components/StylePanel/StylePanelButtonPicker.svelte'
export { default as StylePanelButtonPickerInline } from './lib/ui/components/StylePanel/StylePanelButtonPickerInline.svelte'
export { default as StylePanelContextProvider } from './lib/ui/components/StylePanel/StylePanelContextProvider.svelte'
export {
	getStylePanelContext,
	type StylePanelContext,
} from './lib/ui/components/StylePanel/StylePanelContext'
export {
	default as StylePanelDoubleDropdownPicker,
	type StylePanelDoubleDropdownPickerProps,
} from './lib/ui/components/StylePanel/StylePanelDoubleDropdownPicker.svelte'
export { default as StylePanelDoubleDropdownPickerInline } from './lib/ui/components/StylePanel/StylePanelDoubleDropdownPickerInline.svelte'
export {
	default as StylePanelDropdownPicker,
	type StylePanelDropdownPickerProps,
} from './lib/ui/components/StylePanel/StylePanelDropdownPicker.svelte'
export { default as StylePanelDropdownPickerInline } from './lib/ui/components/StylePanel/StylePanelDropdownPickerInline.svelte'
export {
	default as StylePanelSubheading,
	type StylePanelSubheadingProps,
} from './lib/ui/components/StylePanel/StylePanelSubheading.svelte'
export {
	default as DefaultImageToolbar,
	type TLUiImageToolbarProps,
} from './lib/ui/components/Toolbar/DefaultImageToolbar.svelte'
export {
	default as DefaultImageToolbarContent,
	type DefaultImageToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultImageToolbarContent.svelte'
export {
	default as DefaultRichTextToolbar,
	type TLUiRichTextToolbarProps,
} from './lib/ui/components/Toolbar/DefaultRichTextToolbar.svelte'
export {
	default as DefaultRichTextToolbarContent,
	type DefaultRichTextToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultRichTextToolbarContent.svelte'
export {
	default as DefaultToolbar,
	type DefaultToolbarProps,
} from './lib/ui/components/Toolbar/DefaultToolbar.svelte'
export { default as ArrowDownToolbarItem } from './lib/ui/components/Toolbar/ArrowDownToolbarItem.svelte'
export { default as ArrowLeftToolbarItem } from './lib/ui/components/Toolbar/ArrowLeftToolbarItem.svelte'
export { default as ArrowRightToolbarItem } from './lib/ui/components/Toolbar/ArrowRightToolbarItem.svelte'
export { default as ArrowToolbarItem } from './lib/ui/components/Toolbar/ArrowToolbarItem.svelte'
export { default as ArrowUpToolbarItem } from './lib/ui/components/Toolbar/ArrowUpToolbarItem.svelte'
export { default as AssetToolbarItem } from './lib/ui/components/Toolbar/AssetToolbarItem.svelte'
export { default as CheckBoxToolbarItem } from './lib/ui/components/Toolbar/CheckBoxToolbarItem.svelte'
export { default as CloudToolbarItem } from './lib/ui/components/Toolbar/CloudToolbarItem.svelte'
export { default as CommentToolbarItem } from './lib/ui/components/Toolbar/CommentToolbarItem.svelte'
export { default as DefaultToolbarContent } from './lib/ui/components/Toolbar/DefaultToolbarContent.svelte'
export { default as DiamondToolbarItem } from './lib/ui/components/Toolbar/DiamondToolbarItem.svelte'
export { default as DrawToolbarItem } from './lib/ui/components/Toolbar/DrawToolbarItem.svelte'
export { default as EllipseToolbarItem } from './lib/ui/components/Toolbar/EllipseToolbarItem.svelte'
export { default as EraserToolbarItem } from './lib/ui/components/Toolbar/EraserToolbarItem.svelte'
export { default as FrameToolbarItem } from './lib/ui/components/Toolbar/FrameToolbarItem.svelte'
export { default as HandToolbarItem } from './lib/ui/components/Toolbar/HandToolbarItem.svelte'
export { default as HeartToolbarItem } from './lib/ui/components/Toolbar/HeartToolbarItem.svelte'
export { default as HexagonToolbarItem } from './lib/ui/components/Toolbar/HexagonToolbarItem.svelte'
export { default as HighlightToolbarItem } from './lib/ui/components/Toolbar/HighlightToolbarItem.svelte'
export { default as LaserToolbarItem } from './lib/ui/components/Toolbar/LaserToolbarItem.svelte'
export { default as LineToolbarItem } from './lib/ui/components/Toolbar/LineToolbarItem.svelte'
export { default as NoteToolbarItem } from './lib/ui/components/Toolbar/NoteToolbarItem.svelte'
export { default as OvalToolbarItem } from './lib/ui/components/Toolbar/OvalToolbarItem.svelte'
export { default as RectangleToolbarItem } from './lib/ui/components/Toolbar/RectangleToolbarItem.svelte'
export { default as RhombusToolbarItem } from './lib/ui/components/Toolbar/RhombusToolbarItem.svelte'
export { default as SelectToolbarItem } from './lib/ui/components/Toolbar/SelectToolbarItem.svelte'
export { default as StarToolbarItem } from './lib/ui/components/Toolbar/StarToolbarItem.svelte'
export { default as TextToolbarItem } from './lib/ui/components/Toolbar/TextToolbarItem.svelte'
export { default as ToolbarItem } from './lib/ui/components/Toolbar/ToolbarItem.svelte'
export { default as TrapezoidToolbarItem } from './lib/ui/components/Toolbar/TrapezoidToolbarItem.svelte'
export { default as TriangleToolbarItem } from './lib/ui/components/Toolbar/TriangleToolbarItem.svelte'
export { createIsToolSelected } from './lib/ui/components/Toolbar/useIsToolSelected.svelte'
export { default as XBoxToolbarItem } from './lib/ui/components/Toolbar/XBoxToolbarItem.svelte'
export {
	default as DefaultVideoToolbar,
	type TLUiVideoToolbarProps,
} from './lib/ui/components/Toolbar/DefaultVideoToolbar.svelte'
export {
	default as DefaultVideoToolbarContent,
	type DefaultVideoToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultVideoToolbarContent.svelte'
export {
	default as OverflowingToolbar,
	type OverflowingToolbarProps,
} from './lib/ui/components/Toolbar/OverflowingToolbar.svelte'
export {
	default as ToggleToolLockedButton,
	type ToggleToolLockedButtonProps,
} from './lib/ui/components/Toolbar/ToggleToolLockedButton.svelte'
export {
	default as CenteredTopPanelContainer,
	type CenteredTopPanelContainerProps,
} from './lib/ui/components/TopPanel/CenteredTopPanelContainer.svelte'
export {
	default as DefaultZoomMenu,
	type TLUiZoomMenuProps,
} from './lib/ui/components/ZoomMenu/DefaultZoomMenu.svelte'
export { default as DefaultZoomMenuContent } from './lib/ui/components/ZoomMenu/DefaultZoomMenuContent.svelte'
export { PORTRAIT_BREAKPOINT } from './lib/ui/constants'
export {
	getA11y,
	type A11yPriority,
	type A11yProviderProps,
	type TLUiA11y,
	type TLUiA11yContextType,
} from './lib/ui/context/a11y'
export {
	unwrapLabel,
	getActions,
	type ActionsProviderProps,
	type TLUiActionItem,
	type TLUiActionsContextType,
} from './lib/ui/context/actions.svelte'
export { getAssetUrls, type AssetUrlsProviderProps } from './lib/ui/context/asset-urls'
export { getBreakpoint, type BreakPointProviderProps } from './lib/ui/context/breakpoints'
export {
	getUiComponents,
	type TLUiComponents,
	type TLUiComponentsProviderProps,
} from './lib/ui/context/components'
export {
	getDialogs,
	type TLUiDialog,
	type TLUiDialogProps,
	type TLUiDialogsContextType,
	type TLUiDialogsProviderProps,
} from './lib/ui/context/dialogs'
export {
	getUiEvents,
	type EventsProviderProps,
	type TLUiEventContextType,
	type TLUiEventData,
	type TLUiEventHandler,
	type TLUiEventMap,
	type TLUiEventSource,
} from './lib/ui/context/events'
export {
	default as SvelteDrawUiContextProvider,
	type TLUiContextProviderProps,
} from './lib/ui/context/SvelteDrawUiContextProvider.svelte'
export {
	getToasts,
	type AlertSeverity,
	type TLUiToast,
	type TLUiToastAction,
	type TLUiToastsContextType,
	type TLUiToastsProviderProps,
} from './lib/ui/context/toasts'
export {
	createCanApplySelectionAction,
	createCanRedo,
	createCanUndo,
	createUnlockedSelectedShapesCount,
} from './lib/ui/hooks/menu-hooks'
export {
	handleNativeOrMenuCopy,
	getMenuClipboardEvents,
	setupNativeClipboardEvents,
} from './lib/ui/hooks/useClipboardEvents.svelte'
export {
	createCollaborationStatus,
	getShowCollaborationUi,
} from './lib/ui/hooks/useCollaborationStatus'
export { getCopyAs } from './lib/ui/hooks/useCopyAs'
export { getExportAs } from './lib/ui/hooks/useExportAs'
export { setupKeyboardShortcuts } from './lib/ui/hooks/useKeyboardShortcuts.svelte'
export { createLocalStorageState } from './lib/ui/hooks/useLocalStorageState.svelte'
export { createMenuIsOpen } from './lib/ui/hooks/useMenuIsOpen'
export { createReadonly } from './lib/ui/hooks/useReadonly'
export { createSomeActionsEnabled } from './lib/ui/hooks/useActionState.svelte'
export { createRelevantStyles } from './lib/ui/hooks/useRelevantStyles'
export {
	onDragFromToolbarToCreateShape,
	getTools,
	type OnDragFromToolbarToCreateShapesOpts,
	type TLUiToolItem,
	type TLUiToolsContextType,
	type TLUiToolsProviderProps,
} from './lib/ui/hooks/useTools.svelte'
export { type TLUiTranslationKey } from './lib/ui/hooks/useTranslation/TLUiTranslationKey'
export { RTL_LANGUAGES, type TLUiTranslation } from './lib/ui/hooks/useTranslation/translations'
export {
	getCurrentTranslation,
	getDirection,
	tryGetCurrentTranslation,
	getTranslation,
	type TLUiTranslationContextType,
	type TLUiTranslationProviderProps,
	type TLUiTranslationValues,
} from './lib/ui/hooks/useTranslation/useTranslation.svelte'
export { iconTypes, type TLUiIconType } from './lib/ui/icon-types'
export {
	createDefaultHelpers,
	type TLUiOverrideHelpers,
	type TLUiOverrides,
} from './lib/ui/overrides.svelte'
export { default as SvelteDrawUi, type SvelteDrawUiProps } from './lib/ui/SvelteDrawUi.svelte'
export { default as SvelteDrawUiInFrontOfTheCanvas } from './lib/ui/SvelteDrawUiInFrontOfTheCanvas.svelte'
export { containBoxSize, downsizeImage, type BoxWidthHeight } from './lib/utils/assets/assets'
export { preloadFont, type TLTypeFace } from './lib/utils/assets/preload-font'
export { getEmbedInfo, type TLEmbedResult } from './lib/utils/embeds/embeds'
export { putExcalidrawContent } from './lib/utils/excalidraw/putExcalidrawContent'
export { copyAs, type CopyAsOptions, type TLCopyType } from './lib/utils/export/copyAs'
export { downloadFile, exportAs, type ExportAsOptions } from './lib/utils/export/exportAs'
export { fitFrameToContent, removeFrame } from './lib/utils/frames/frames'
export {
	defaultEditorAssetUrls,
	setDefaultEditorAssetUrls,
	type TLEditorAssetUrls,
} from './lib/utils/static-assets/assetUrls'
export { sanitizeSvg } from './lib/utils/svg/sanitizeSvg'
export {
	defaultAddFontsFromNode,
	getTipTapDefaultExtensions,
	KeyboardShiftEnterTweakExtension,
	renderHtmlFromRichText,
	renderHtmlFromRichTextForMeasurement,
	renderHtmlFromRichTextWithExtensions,
	renderPlaintextFromRichText,
	renderRichTextFromHTML,
	tipTapDefaultExtensions,
} from './lib/utils/text/richText'
export { truncateStringWithEllipsis } from './lib/utils/text/text'
export {
	Extension,
	getSchema,
	Mark,
	mergeAttributes,
	Node,
	TaskItem,
	TaskList,
	type Extensions,
	type JSONContent,
	type TaskItemOptions,
	type TaskListOptions,
} from './lib/utils/text/tiptap'
export {
	defaultWrappingPairs,
	WrapSelectionExtension,
	type WrapSelectionOptions,
} from './lib/utils/text/wrapSelection'
export {
	buildFromV1Document,
	TLV1AlignStyle,
	TLV1AssetType,
	TLV1ColorStyle,
	TLV1DashStyle,
	TLV1Decoration,
	TLV1FontStyle,
	TLV1ShapeType,
	TLV1SizeStyle,
	type TLV1ArrowBinding,
	type TLV1ArrowShape,
	type TLV1Asset,
	type TLV1BaseAsset,
	type TLV1BaseBinding,
	type TLV1BaseShape,
	type TLV1Binding,
	type TLV1Bounds,
	type TLV1Document,
	type TLV1DrawShape,
	type TLV1EllipseShape,
	type TLV1GroupShape,
	type TLV1Handle,
	type TLV1ImageAsset,
	type TLV1ImageShape,
	type TLV1Page,
	type TLV1PageState,
	type TLV1RectangleShape,
	type TLV1Shape,
	type TLV1ShapeStyles,
	type TLV1StickyShape,
	type TLV1TextShape,
	type TLV1TriangleShape,
	type TLV1VideoAsset,
	type TLV1VideoShape,
} from './lib/utils/tldr/buildFromV1Document'
export {
	parseAndLoadDocument,
	parseSvelteDrawJsonFile,
	serializeSvelteDrawJson,
	serializeSvelteDrawJsonBlob,
	SVELTE_DRAW_FILE_EXTENSION,
	type SvelteDrawFile,
	type SvelteDrawFileParseError,
} from './lib/utils/tldr/file'

export type { RichTextSVGProps } from './lib/shapes/shared/RichTextSVG.svelte'
export type { TextAreaProps } from './lib/shapes/text/TextAreaProps'
export type { DebugFlagsProps } from './lib/ui/components/DebugMenu/DebugFlags.svelte'
export type { ExampleDialogProps } from './lib/ui/components/DebugMenu/ExampleDialog.svelte'
export type { FeatureFlagsProps } from './lib/ui/components/DebugMenu/FeatureFlags.svelte'
export type { StylePanelSectionProps } from './lib/ui/components/StylePanel/StylePanelSection.svelte'
export type { StylePanelContextProviderProps } from './lib/ui/components/StylePanel/StylePanelContextProvider.svelte'
export type { ToolbarItemProps } from './lib/ui/components/Toolbar/ToolbarItem.svelte'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
// Attachment that registers native (non-delegated) listeners, for handlers that must run before
// the editor container's own listeners (stopPropagation / markEventAsHandled).
export { nativeEvents } from './lib/shapes/shared/nativeEvents'
