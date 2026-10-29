import translationsEnJson from '../../public/tla/locales-compiled/en.json'
import type { IntlMessages } from './intl'

/** The English catalog the build compiles from the declared messages (`pnpm build-i18n`). */
export const enMessages = translationsEnJson as unknown as IntlMessages
