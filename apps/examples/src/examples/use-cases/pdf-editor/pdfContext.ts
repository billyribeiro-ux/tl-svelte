import { createContext } from 'svelte'
import type { Pdf } from './PdfPicker.svelte'

// The overlay and the export button are mounted by the editor without props, so they read the
// open PDF from the `PdfEditor` that renders the editor.
export const [getPdf, setPdf] = createContext<{ readonly current: Pdf }>()
