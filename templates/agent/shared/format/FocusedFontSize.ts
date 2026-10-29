import { z } from 'zod'

// This module is imported by the Cloudflare Worker (through the action schemas), so it must stay
// free of runtime imports from the svelte-draw SDK. The conversion helpers that need the editor
// live in `convertFontSize.ts`, which only the browser code imports.
export const FocusedFontSize = z.number()
