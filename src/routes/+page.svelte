<script>
	import { gaiaQuery } from '$lib/store';
	import { getGaiaQueryString, getData } from '$lib/query';
	import { getDuckDB } from '$lib/components/providers/duckdb';
	import { Galaxy } from '$lib/components/galaxy';
	let duckdb = getDuckDB();

	$: gaiaQueryString = getGaiaQueryString();
	$: $gaiaQuery = getData($duckdb, gaiaQueryString);
</script>

<svelte:head>
	<title>Voyager</title>
</svelte:head>

{#await $gaiaQuery}
	<h1>Loading galaxy...</h1>
{:then gaia}
	<Galaxy data={gaia} />
{/await}
