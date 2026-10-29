<script lang="ts">
	import { fromComputed, fromSignal, getEditor } from 'svelte-draw'
	import { restartGame } from './actions'
	import { enemies$, gameOver$, gold$, lives$, projectiles$, score$ } from './game-state'

	const editor = getEditor()
	const score = fromSignal(score$)
	const gold = fromSignal(gold$)
	const lives = fromSignal(lives$)
	const enemyCount = fromComputed('enemies', () => enemies$.get().length)
	const projectileCount = fromComputed('projectiles', () => projectiles$.get().length)
	const gameOver = fromSignal(gameOver$)

	const onRestart = () => restartGame(editor)
</script>

<div class="td-hud">
	<div class="td-hud__row">
		<span>
			Gold <strong>{gold.current}</strong>
		</span>
		<span>
			Score <strong>{score.current}</strong>
		</span>
		<span>
			Lives <strong>{lives.current}</strong>
		</span>
		<span>
			Enemies <strong>{enemyCount.current}</strong>
		</span>
		<span>
			Shots <strong>{projectileCount.current}</strong>
		</span>
		<button class="td-hud__btn" onclick={onRestart}>Restart</button>
	</div>
	<div class="td-hud__hint">
		Pick a tower from the toolbar (or press <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd>), then click the
		canvas to place it. Each tower costs gold; kill enemies to earn more. Magic blasts deal area
		damage. Click an enemy to chip damage for free. Press <kbd>space</kbd> to restart.
	</div>
	{#if gameOver.current}<div class="td-hud__gameover">Game over — press Restart</div>{/if}
</div>
