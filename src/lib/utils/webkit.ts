/**
 * Is this page running on Apple's WebKit — Safari on a Mac, or any browser on
 * an iPhone or iPad (every one of them is WebKit underneath)?
 *
 * Why it exists: those engines report `canPlayType('video/webm')` as
 * "probably" and so choose a VP9 `<source>` over the mp4s that follow it, but
 * they do not honour VP9's alpha channel — Safari 18 on a Mac plays the clip
 * with its transparent area painted opaque white, and older WebKit does not
 * play it at all — and a `<video>` never falls back once it has picked a
 * source. There is no feature test for "VP9 with alpha", so the user agent is
 * the only signal — read at call time, so that a component can ask on mount
 * and a test can stub `navigator.userAgent`.
 *
 * Desktop Chrome, Edge, Opera and Firefox (Mac ones included) and Android
 * browsers all answer `false`.
 *
 * @param ua - User-agent string to classify. Defaults to the live
 *   `navigator.userAgent`; an empty string (no DOM, as on the server) is `false`.
 * @returns Whether the engine is Apple's WebKit.
 */
export function isAppleWebKit(ua: string = globalThis.navigator?.userAgent ?? ''): boolean {
	if (!/AppleWebKit\//.test(ua)) return false;
	// iOS and iPadOS: Chrome, Firefox, Edge and the rest all wrap WebKit.
	if (/\b(iPhone|iPad|iPod)\b/.test(ua)) return true;
	// A Mac — which is also what iPadOS Safari reports in its desktop mode.
	// Chromium-based browsers and Firefox carry their own marker (no word
	// boundary before it: headless Chromium is `HeadlessChrome/`); Safari is
	// the WebKit browser without one.
	return (
		/Macintosh/.test(ua) &&
		/\bSafari\//.test(ua) &&
		!/(Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|Firefox|FxiOS)\//.test(ua)
	);
}
