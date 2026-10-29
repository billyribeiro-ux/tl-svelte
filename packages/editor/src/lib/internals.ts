import { version } from '../version'
import { watermarkDesktopSvg, watermarkMobileSvg } from './watermarks'

/**
 * Values the UI binding packages need from the editor but that are generated files, which cannot
 * carry release tags of their own.
 */

/** @internal */
export const editorVersion: string = version

/** @internal */
export const editorWatermarkDesktopSvg: string = watermarkDesktopSvg

/** @internal */
export const editorWatermarkMobileSvg: string = watermarkMobileSvg
