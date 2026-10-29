<div class="chat-fallback">
	<p>Error loading chat history</p>
	<button
		onclick={() => {
			localStorage.clear()
			window.location.reload()
		}}
	>
		Clear chat history
	</button>
</div>
