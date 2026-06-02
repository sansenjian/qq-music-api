import { compareVersions, computeBetaVersion, parseVersion } from '../../../scripts/compute-beta-version.js';

describe('scripts/compute-beta-version', () => {
	test('uses the next patch after the current package version when npm latest is missing', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				runNumber: '123',
				runAttempt: '1',
			}),
		).toBe('2.3.5-beta.123.1');
	});

	test('uses npm latest when it is newer than the current package version', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				npmLatestVersion: '2.3.5',
				runNumber: '124',
				runAttempt: '2',
			}),
		).toBe('2.3.6-beta.124.2');
	});

	test('keeps the current package version as the base when it is newer than npm latest', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.4.0',
				npmLatestVersion: '2.3.9',
				runNumber: '125',
				runAttempt: '1',
			}),
		).toBe('2.4.1-beta.125.1');
	});

	test('compares stable parts when versions include prerelease labels', () => {
		expect(compareVersions(parseVersion('2.3.5-beta.1'), parseVersion('2.3.4'))).toBeGreaterThan(0);
		expect(
			computeBetaVersion({
				currentVersion: '2.3.5-beta.1',
				npmLatestVersion: '2.3.5',
				runNumber: '126',
				runAttempt: '3',
			}),
		).toBe('2.3.6-beta.126.3');
	});

	test('rejects invalid versions and prerelease identifiers', () => {
		expect(() =>
			computeBetaVersion({
				currentVersion: 'bad',
				runNumber: '127',
				runAttempt: '1',
			}),
		).toThrow('current package version must be a semver version');

		expect(() =>
			computeBetaVersion({
				currentVersion: '2.3.4',
				runNumber: '127.1',
				runAttempt: '1',
			}),
		).toThrow('run number must be a valid prerelease identifier');
	});
});
