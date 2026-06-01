import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './koaApp';
import { startServer } from './server';

const resolveRealPath = (filePath: string): string => {
	try {
		return fs.realpathSync.native(filePath);
	} catch {
		return path.resolve(filePath);
	}
};

// Service info (only when run directly, not imported as library)
const entryFile = process.argv[1] ? resolveRealPath(process.argv[1]) : '';
const currentFile = resolveRealPath(fileURLToPath(import.meta.url));
if (entryFile === currentFile) {
	startServer();
}

export default app;
