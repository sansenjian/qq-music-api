import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pkg from '../package.json';
import { apiMetadata } from './root-compat';
import { registerQqMusicMcpTools } from './tools';
import type { QqMusicMcpServices } from './tools';

interface CreateQqMusicMcpServerOptions {
	services?: QqMusicMcpServices;
}

const SERVER_NAME = 'qq-music-api-mcp-server';

export const createQqMusicMcpServer = (options: CreateQqMusicMcpServerOptions = {}): McpServer => {
	const server = new McpServer({
		name: SERVER_NAME,
		version: pkg.version,
	});

	registerQqMusicMcpTools(server, options.services);
	server.registerResource(
		'qq_music_api_catalog',
		'qq-music://api-catalog',
		{
			title: 'QQ Music API Catalog',
			description: 'Static catalog of QQ Music API HTTP routes exposed by this package.',
			mimeType: 'application/json',
		},
		async uri => ({
			contents: [
				{
					uri: uri.href,
					mimeType: 'application/json',
					text: JSON.stringify(apiMetadata, null, 2),
				},
			],
		}),
	);

	return server;
};

export const runMcpServer = async (): Promise<void> => {
	const server = createQqMusicMcpServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error(`${SERVER_NAME} running on stdio`);
};
