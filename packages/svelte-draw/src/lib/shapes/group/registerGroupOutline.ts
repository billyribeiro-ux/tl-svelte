import { GroupShapeUtil } from '@svelte-draw/editor'
import DashedOutlineBox from './DashedOutlineBox.svelte'

// The editor's `GroupShapeUtil` is UI-free: its `component()` returns nothing until an outline
// component is registered. Importing this module (done by `defaultShapeUtils`) registers the SDK's.
GroupShapeUtil.outlineComponent = DashedOutlineBox
