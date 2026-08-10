export interface JsonRpcResponse<T = unknown> {
	jsonrpc: '2.0';
	id: number;
	result?: T;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

export const parseJsonRpcResponse = (line: string): JsonRpcResponse | undefined => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(line) as unknown;
	} catch {
		return undefined;
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
	const response = parsed as Record<string, unknown>;
	if (response.jsonrpc !== '2.0' || typeof response.id !== 'number' || !Number.isSafeInteger(response.id)) {
		return undefined;
	}

	return response as unknown as JsonRpcResponse;
};
