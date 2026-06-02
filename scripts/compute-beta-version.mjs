import { pathToFileURL } from 'node:url';

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-.+)?$/;
const PRERELEASE_IDENTIFIER_PATTERN = /^[0-9A-Za-z-]+$/;

export const parseVersion = (value, label = 'version') => {
	const normalized = String(value || '').trim();
	const match = normalized.match(VERSION_PATTERN);

	if (!match) {
		throw new Error(`${label} must be a semver version, got "${normalized || '<empty>'}".`);
	}

	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		raw: normalized,
	};
};

export const compareVersions = (left, right) => {
	if (left.major !== right.major) return left.major - right.major;
	if (left.minor !== right.minor) return left.minor - right.minor;
	return left.patch - right.patch;
};

const prereleaseIdentifier = (value, fallback, label) => {
	const normalized = String(value || fallback).trim();

	if (!normalized || !PRERELEASE_IDENTIFIER_PATTERN.test(normalized)) {
		throw new Error(`${label} must be a valid prerelease identifier.`);
	}

	return normalized;
};

export const computeBetaVersion = ({ currentVersion, npmLatestVersion, runNumber, runAttempt }) => {
	const current = parseVersion(currentVersion, 'current package version');
	const candidates = [current];
	const latest = String(npmLatestVersion || '').trim();

	if (latest) {
		candidates.push(parseVersion(latest, 'npm latest version'));
	}

	const base = candidates.reduce((highest, candidate) =>
		compareVersions(candidate, highest) > 0 ? candidate : highest,
	);
	const run = prereleaseIdentifier(runNumber, process.env.GITHUB_RUN_NUMBER || 'local', 'run number');
	const attempt = prereleaseIdentifier(runAttempt, process.env.GITHUB_RUN_ATTEMPT || '1', 'run attempt');

	return `${base.major}.${base.minor}.${base.patch + 1}-beta.${run}.${attempt}`;
};

const main = () => {
	const [currentVersion, npmLatestVersion = '', runNumber, runAttempt] = process.argv.slice(2);

	if (!currentVersion) {
		throw new Error(
			'Usage: node scripts/compute-beta-version.mjs <current-version> [npm-latest-version] [run] [attempt]',
		);
	}

	console.log(computeBetaVersion({ currentVersion, npmLatestVersion, runNumber, runAttempt }));
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		main();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
