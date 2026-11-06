/**
 * `isAppleWebKit` is a user-agent classifier, so the cases are user agents:
 * the engines that cannot decode transparent VP9 (Safari on a Mac, everything
 * on iOS) answer true, every other browser false.
 */

import { describe, it, expect } from 'vitest';
import { isAppleWebKit } from './webkit.js';

const SAFARI_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const SAFARI_IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME_IOS =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1';
const FIREFOX_IOS =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/126.0 Mobile/15E148 Safari/605.1.15';
/** iPadOS Safari in its default "desktop website" mode reports a Mac. */
const SAFARI_IPAD_DESKTOP_MODE =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const IOS_WEBVIEW =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

const CHROME_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const EDGE_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0';
const OPERA_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 OPR/111.0.0.0';
const FIREFOX_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:126.0) Gecko/20100101 Firefox/126.0';
const CHROME_WINDOWS =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const CHROME_ANDROID =
	'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';
const HEADLESS_CHROME =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/125.0.0.0 Safari/537.36';

describe('isAppleWebKit', () => {
	it.each([
		['Safari on a Mac', SAFARI_MAC],
		['Safari on an iPhone', SAFARI_IPHONE],
		['Chrome on iOS (WebKit underneath)', CHROME_IOS],
		['Firefox on iOS (WebKit underneath)', FIREFOX_IOS],
		['Safari on an iPad in desktop mode', SAFARI_IPAD_DESKTOP_MODE],
		['an iOS web view', IOS_WEBVIEW]
	])('is true for %s', (_, ua) => {
		expect(isAppleWebKit(ua)).toBe(true);
	});

	it.each([
		['Chrome on a Mac', CHROME_MAC],
		['Edge on a Mac', EDGE_MAC],
		['Opera on a Mac', OPERA_MAC],
		['Firefox on a Mac', FIREFOX_MAC],
		['Chrome on Windows', CHROME_WINDOWS],
		['Chrome on Android', CHROME_ANDROID],
		['headless Chromium (the test browser)', HEADLESS_CHROME]
	])('is false for %s', (_, ua) => {
		expect(isAppleWebKit(ua)).toBe(false);
	});

	it('is false with no user agent at all, as on the server', () => {
		expect(isAppleWebKit('')).toBe(false);
	});

	it('reads the live navigator when called without an argument', () => {
		// The node project has no navigator (or Node's own, which is not WebKit).
		expect(isAppleWebKit()).toBe(false);
	});
});
