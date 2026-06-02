import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { computeMainVersion } from './compute-release-version.mjs';

console.log('Bumping version in package.json...');

try {
	const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	const oldVersion = pkg.version;
	console.log(`Current version: ${oldVersion}`);

	const newVersion = computeMainVersion(oldVersion);
	pkg.version = newVersion;
	fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, '\t')}\n`);
	console.log(`Version bumped to ${newVersion}`);

	const mcpPackagePath = 'packages/mcp/package.json';
	if (fs.existsSync(mcpPackagePath)) {
		console.log('Syncing MCP package version...');
		const mcpPkg = JSON.parse(fs.readFileSync(mcpPackagePath, 'utf8'));
		mcpPkg.version = newVersion;
		fs.writeFileSync(mcpPackagePath, `${JSON.stringify(mcpPkg, null, '\t')}\n`);
		console.log(`MCP package version synced to ${newVersion}`);

		console.log('Refreshing package lock...');
		execSync('npm install --package-lock-only --ignore-scripts', { stdio: 'inherit' });
		console.log('Package lock refreshed successfully');
	}

	console.log('Generating CHANGELOG...');
	execSync('npm run changelog', { stdio: 'inherit' });
	console.log('CHANGELOG generated successfully');

	console.log('Generating version.json...');
	execSync('node scripts/generate-version.js', { stdio: 'inherit' });
	console.log('version.json generated successfully');

	if (process.env.GITHUB_OUTPUT) {
		fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`);
	}

	console.log(`New version: ${newVersion}`);
} catch (error) {
	console.error('Error during version bump:', error.message);
	console.error('Version bump failed. Please check the error messages above.');
	process.exit(1);
}
