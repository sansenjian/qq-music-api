import { assertSameVersionLine } from '../../../scripts/check-version-line.mjs';

describe('scripts/check-version-line', () => {
	test('accepts versions on the same manual and main line', () => {
		expect(
			assertSameVersionLine({
				currentVersion: '2.4.3',
				baseVersion: '2.4.0',
				currentLabel: 'dev',
				baseLabel: 'main',
			}),
		).toEqual({ currentLine: '2.4', baseLine: '2.4' });
	});

	test('accepts prerelease versions on the same line', () => {
		expect(
			assertSameVersionLine({
				currentVersion: '2.4.3-beta.123.1',
				baseVersion: '2.4.0',
			}),
		).toEqual({ currentLine: '2.4', baseLine: '2.4' });
	});

	test('rejects when the main segment differs', () => {
		expect(() =>
			assertSameVersionLine({
				currentVersion: '2.3.4',
				baseVersion: '2.4.0',
				currentLabel: 'dev package version',
				baseLabel: 'main package version',
			}),
		).toThrow(
			'dev package version line 2.3.x must match main package version line 2.4.x. Sync the main release version back into dev before merging.',
		);
	});

	test('rejects when the manual segment differs', () => {
		expect(() =>
			assertSameVersionLine({
				currentVersion: '3.4.0',
				baseVersion: '2.4.0',
			}),
		).toThrow('current version line 3.4.x must match base version line 2.4.x');
	});
});
