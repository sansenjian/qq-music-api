import { parseShareUrl } from '../../../src/util/parseShareUrl';

describe('util/parseShareUrl', () => {
	test('parses a numeric QQ Music playlist URL', () => {
		expect(parseShareUrl('https://y.qq.com/n/ryqq/playlist/2029866739')).toMatchObject({
			type: 'songlist',
			disstid: '2029866739',
		});
	});

	test('accepts a bare QQ Music URL and strips trailing punctuation', () => {
		expect(parseShareUrl('y.qq.com/n/ryqq/playlist/2029866739。')).toMatchObject({
			type: 'songlist',
			disstid: '2029866739',
		});
	});

	test('extracts a QQ Music URL embedded in surrounding text', () => {
		expect(parseShareUrl('分享给你 https://y.qq.com/n/ryqq/playlist/2029866739 超好听')).toMatchObject({
			type: 'songlist',
			disstid: '2029866739',
		});
	});

	test('parses a playlist URL with an alphabetic MID', () => {
		const parsed = parseShareUrl('https://y.qq.com/n/ryqq/playlist/CBOE123456');

		expect(parsed).toMatchObject({
			type: 'songlist',
			mid: 'CBOE123456',
		});
		expect(parsed.disstid).toBeUndefined();
	});

	test.each([
		'《https://y.qq.com/n/ryqq/playlist/2029866739》',
		'“https://y.qq.com/n/ryqq/playlist/2029866739”',
		'href="https://y.qq.com/n/ryqq/playlist/2029866739"',
	])('strips common rich-text punctuation from %s', value => {
		expect(parseShareUrl(value)).toMatchObject({ type: 'songlist', disstid: '2029866739' });
	});

	test('parses a playlist query without a trailing slash', () => {
		expect(parseShareUrl('https://y.qq.com/n/ryqq/playlist?id=2029866739')).toMatchObject({
			type: 'songlist',
			disstid: '2029866739',
		});
	});

	test('rejects playlist-shaped URLs on unrelated domains', () => {
		expect(parseShareUrl('https://example.com/n/ryqq/playlist/2029866739').type).toBe('unknown');
	});

	test('rejects non-HTTP protocols even when the hostname looks valid', () => {
		expect(parseShareUrl('javascript://y.qq.com/n/ryqq/playlist/2029866739').type).toBe('unknown');
	});

	test('does not throw on malformed percent encoding', () => {
		expect(() => parseShareUrl('https://y.qq.com/n/ryqq/playlist/%E0%A4%A')).not.toThrow();
	});
});
