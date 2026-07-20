import { parseJsonp } from '../../../src/util/parseJsonp';

describe('util/parseJsonp', () => {
	test('parses JSON containing parentheses without treating it as JSONP', () => {
		expect(parseJsonp<{ desc: string }>('{"desc":"a(b)c"}')).toEqual({ desc: 'a(b)c' });
	});

	test('parses JSONP with nested parentheses in string values', () => {
		expect(parseJsonp('MusicJsonCallback({"desc":"a(b)c","list":[1,2]})')).toEqual({
			desc: 'a(b)c',
			list: [1, 2],
		});
	});

	test('returns non-JSON text unchanged', () => {
		expect(parseJsonp('upstream failure')).toBe('upstream failure');
	});
});
