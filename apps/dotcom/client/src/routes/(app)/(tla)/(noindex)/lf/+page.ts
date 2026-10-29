import { getAllPersistenceKeys } from '../../../../../tla/pages/local-file-index'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => ({ keys: await getAllPersistenceKeys() })
