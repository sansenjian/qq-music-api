import { pathToFileURL } from 'node:url';
import { parseVersion } from './compute-release-version.mjs';

const versionLine = version => `${version.major}.${version.minor}`;

export const assertSameVersionLine = ({
	currentVersion,
	baseVersion,
	currentLabel = 'current version',
	baseLabel = 'base version',
}) => {
	const current = parseVersion(currentVersion, currentLabel);
	const base = parseVersion(baseVersion, baseLabel);
	const currentLine = versionLine(current);
	const baseLine = versionLine(base);

	if (currentLine !== baseLine) {
		throw new Error(
			`${currentLabel} line ${currentLine}.x must match ${baseLabel} line ${baseLine}.x. Sync the main release version back into dev before merging.`,
		);
	}

	return { currentLine, baseLine };
};

const main = () => {
	const [currentVersion, baseVersion, currentLabel = 'current version', baseLabel = 'base version'] =
		process.argv.slice(2);

	if (!currentVersion || !baseVersion) {
		throw new Error(
			'Usage: node scripts/check-version-line.mjs <current-version> <base-version> [current-label] [base-label]',
		);
	}

	const { currentLine } = assertSameVersionLine({ currentVersion, baseVersion, currentLabel, baseLabel });
	console.log(`${currentLabel} and ${baseLabel} are on version line ${currentLine}.x.`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		main();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
