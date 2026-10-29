import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'
import * as T from './lib/validation'

export {
	ArrayOfValidator,
	DictValidator,
	ObjectValidator,
	UnionValidator,
	Validator,
	type UnionValidatorConfig,
} from './lib/validation'
export { T }

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
