<script lang="ts">
	import { fromSignal, getEditor } from 'svelte-draw'
	import { pickSelect, pickTower } from './actions'
	import { gold$, placingTower$ } from './game-state'
	import SelectGlyph from './SelectGlyph.svelte'
	import { TOWER_GEOS, TOWER_STATS_BY_GEO } from './tower-config'
	import TowerGlyph from './TowerGlyph.svelte'

	const editor = getEditor()
	const placingGeo = fromSignal(placingTower$)
	const gold = fromSignal(gold$)

	const onPickSelect = () => pickSelect(editor)
</script>

<div class="td-toolbar">
	<button
		class={'td-toolbar__btn' + (placingGeo.current === null ? ' is-active' : '')}
		onclick={onPickSelect}
		title="Select (Esc)"
	>
		<SelectGlyph />
		<span class="td-toolbar__label">Select</span>
		<span class="td-toolbar__cost">
			<kbd>esc</kbd>
		</span>
	</button>
	{#each TOWER_GEOS as geo, i (geo)}
		{@const stats = TOWER_STATS_BY_GEO[geo]}
		{@const isActive = placingGeo.current === geo}
		{@const canAfford = gold.current >= stats.cost}
		<button
			class={'td-toolbar__btn' + (isActive ? ' is-active' : '') + (canAfford ? '' : ' is-disabled')}
			onclick={() => canAfford && pickTower(geo)}
			disabled={!canAfford}
			title={`${stats.label} (${geo}) — ${stats.cost} gold — press ${i + 1}`}
		>
			<TowerGlyph {geo} />
			<span class="td-toolbar__label">{stats.label}</span>
			<span class="td-toolbar__cost">
				{stats.cost}g · <kbd>{i + 1}</kbd>
			</span>
		</button>
	{/each}
</div>
