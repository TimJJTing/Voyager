import { writable } from 'svelte/store';
/**
 * @type {import('svelte/store').Writable<Promise<any[] | undefined>>}
 */
export const gaiaQuery = writable();
