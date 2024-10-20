<script>
	/** @type {import('./$types').PageData} */
	// export let data;
</script>

<div id="app">
	<slot />
</div>

<style>
	#app {
		width: 100vw;
		height: 100vh;
	}
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
