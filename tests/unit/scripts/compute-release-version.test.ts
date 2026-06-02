import {
	compareVersions,
	computeBetaVersion,
	computeMainVersion,
	parseVersion,
} from '../../../scripts/compute-release-version.mjs';

describe('scripts/compute-release-version', () => {
	test('uses the next dev segment after the current package version when npm latest is missing', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				runNumber: '123',
				runAttempt: '1',
			}),
		).toBe('2.3.5-beta.123.1');
	});

	test('uses npm latest main/dev segments when it is newer than the current package version', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				npmLatestVersion: '2.4.0',
				runNumber: '124',
				runAttempt: '2',
			}),
		).toBe('2.4.1-beta.124.2');
	});

	test('continues from npm beta when it is newer than npm latest in the same release line', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				npmLatestVersion: '2.4.0',
				npmBetaVersion: '2.4.3-beta.200.1',
				runNumber: '201',
				runAttempt: '1',
			}),
		).toBe('2.4.4-beta.201.1');
	});

	test('uses the main branch version when dev has not synced the latest stable bump', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.3.4',
				npmLatestVersion: '2.3.4',
				mainVersion: '2.4.0',
				runNumber: '203',
				runAttempt: '1',
			}),
		).toBe('2.4.1-beta.203.1');
	});

	test('resets the dev segment from npm latest when the latest stable line is newer than npm beta', () => {
		expect(
			computeBetaVersion({
				currentVersion: '2.4.0',
				npmLatestVersion: '2.5.0',
				npmBetaVersion: '2.4.9-beta.200.1',
				runNumber: '202',
				runAttempt: '1',
			}),
		).toBe('2.5.1-beta.202.1');
	});

	test('rejects npm beta when it is ahead of the selected release line', () => {
		expect(() =>
			computeBetaVersion({
				currentVersion: '2.3.4',
				npmLatestVersion: '2.3.4',
				npmBetaVersion: '2.4.9-beta.200.1',
				runNumber: '204',
				runAttempt: '1',
			}),
		).toThrow('npm beta version 2.4.9-beta.200.1 is ahead of the selected release line 2.3.x');
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

	test('increments the main segment and resets the dev segment for stable releases', () => {
		expect(computeMainVersion('2.3.4')).toBe('2.4.0');
		expect(computeMainVersion('2.3.5-beta.1')).toBe('2.4.0');
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
