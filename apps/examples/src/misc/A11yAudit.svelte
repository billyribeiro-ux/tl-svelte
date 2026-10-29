<script lang="ts">
	import { SvelteDrawUiMenuItem, getDialogs } from 'svelte-draw'
	import A11yAuditDialog from './A11yAuditDialog.svelte'
	import { a11yAuditResults } from './a11yAuditResults.svelte'

	const { addDialog } = getDialogs()

	const runA11yAudit = async () => {
		const axe = (await import('axe-core')).default
		axe.run(document, {}, (err, results) => {
			if (err) throw err

			// eslint-disable-next-line no-console
			console.debug('[a11y]:', results)

			a11yAuditResults.set(results)
			addDialog({
				component: A11yAuditDialog,
				onClose: () => {
					void null
				},
			})
		})
	}
</script>

<SvelteDrawUiMenuItem id="a11y-audit" onSelect={runA11yAudit} label="A11y audit" />
