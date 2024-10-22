<script>
	/** @type {import('./$types').PageData} */
	// export let data;

	import { base } from '$app/paths';
	import { DuckDB } from '$lib/components/providers/duckdb';
	/** @type {{name: string, url: string}[]} */
	let connections = [{ name: 'gaia030.parquet', url: `${base}/gaia030.parquet` }];
</script>

<div class="app">
	<DuckDB {connections}>
		<slot />
	</DuckDB>
</div>

<style>
	.app {
		margin: 0;
		padding: 16px;
		width: 100vw;
		height: 100vh;
		background-color: black;
		color: white;
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: black;
	}
</style>
