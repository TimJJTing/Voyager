export const getGaiaQueryString = () =>
	`SELECT x, y, z FROM parquet_scan('gaia.parquet') LIMIT 1;`;

/**
 * @param {import('$lib/components/providers/duckdb/DuckDB').DuckDB | undefined} database
 * @param {string} queryString
 */
export const getData = async (database, queryString) => {
	const results = await database?.query(queryString);
	return results;
};
