import { parseJsonRpcResponse } from '../../../scripts/smoke-mcp-explorer-utils';

describe('scripts/smoke-mcp-explorer-utils', () => {
	test('parses a valid JSON-RPC response', () => {
		expect(parseJsonRpcResponse('{"jsonrpc":"2.0","id":1,"result":{"ok":true}}')).toEqual({
			jsonrpc: '2.0',
			id: 1,
			result: { ok: true },
		});
	});

	test.each(['invalid', 'null', '[]', '{}', '"text"', '1', 'true', '{"jsonrpc":"2.0"}'])(
		'ignores malformed or non-response stdout lines: %s',
		line => {
			expect(parseJsonRpcResponse(line)).toBeUndefined();
		},
	);
});
