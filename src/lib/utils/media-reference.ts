/**
 * The MEDIA REFERENCE contract: what a host's image column stores and how it
 * becomes a URL — the one owner of the Storage public-URL shape, which the
 * website's read boundary, the CMS mirror and the CMS's save path each used
 * to spell for themselves (and had already disagreed on: a trailing slash on
 * the origin, a fold that took any host, a thumbnail that never resolved).
 *
 * A picture in a host's public `media` bucket is stored as `/media/<key>` —
 * the object's key, with nothing of the environment in it. The host passes
 * its Storage origin (`PUBLIC_SUPABASE_URL`, `WEBSITE_SUPABASE_URL`) to the
 * two halves below, so the shape lives here and the environment there.
 *
 * An SVG resolves as an attachment (`?download`): the bucket is public and
 * same-origin with the project's Auth and REST endpoints, so a browser sent
 * straight at an SVG must save it rather than render it; `<img>` ignores the
 * disposition.
 */
export const MEDIA_PREFIX = '/media/';

const PUBLIC_PATH = '/storage/v1/object/public/media/';
const SVG_DOWNLOAD = '?download';

/** An origin without its trailing slashes — `https://x.co/` and `https://x.co` are one origin. */
const bare = (origin: string): string => origin.replace(/\/+$/, '');

/**
 * A stored value → what `<img>` loads. A `/media/<key>` reference resolves
 * against `storageOrigin`; anything else — a static asset path, an external
 * `https://` picture, an absolute URL an older upload stored — passes
 * through, and so does a reference when the host has no origin to give.
 */
export function resolveMediaReference(value: string, storageOrigin: string): string {
	if (!value.startsWith(MEDIA_PREFIX) || !storageOrigin) return value;
	const key = value.slice(MEDIA_PREFIX.length);
	const download = key.toLowerCase().endsWith('.svg') ? SVG_DOWNLOAD : '';
	return `${bare(storageOrigin)}${PUBLIC_PATH}${key}${download}`;
}

/**
 * The inverse, for a host that saves back what a panel SHOWED (the resolved
 * URL): THIS origin's public media URL folds to its `/media/<key>`
 * reference, with or without the SVG query; any other value — another
 * project's bucket included — is left as it is.
 */
export function foldMediaUrl(value: string, storageOrigin: string): string {
	if (!storageOrigin) return value;
	const prefix = `${bare(storageOrigin)}${PUBLIC_PATH}`;
	if (!value.startsWith(prefix)) return value;
	const key = value.slice(prefix.length).replace(/\?download$/, '');
	return key && !key.includes('?') && !key.includes('#') ? `${MEDIA_PREFIX}${key}` : value;
}
