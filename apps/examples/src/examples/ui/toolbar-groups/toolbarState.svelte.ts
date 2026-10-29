// The toolbar override is a component, so it can't close over the example's state the way the
// React `useMemo` did. The orientation lives in this shared module state instead.
export const toolbarState = $state<{ orientation: 'horizontal' | 'vertical' }>({
	orientation: 'horizontal',
})
