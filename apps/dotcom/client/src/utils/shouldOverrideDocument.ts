import type { TLUiDialogsContextType } from 'svelte-draw'
import ConfirmOpenDialog from './ConfirmOpenDialog.svelte'
import { withDialogProps } from './withDialogProps'

/** @public */
export function shouldOverrideDocument(addDialog: TLUiDialogsContextType['addDialog']) {
	return new Promise<boolean>((resolve) => {
		addDialog({
			component: withDialogProps(ConfirmOpenDialog, {
				onCancel: () => resolve(false),
				onContinue: () => resolve(true),
			}),
			onClose: () => {
				resolve(false)
			},
		})
	})
}
