const runMcpServerMock = vi.fn();

vi.mock('../../src/mcp/server', () => ({
	runMcpServer: runMcpServerMock,
}));

describe('CLI', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		runMcpServerMock.mockReset();
	});

	test('keeps stdout redirected for the MCP server lifetime', async () => {
		runMcpServerMock.mockResolvedValue(undefined);
		const originalLog = console.log;
		const originalInfo = console.info;
		const originalWarn = console.warn;
		const originalDebug = console.debug;
		const originalExitListeners = process.rawListeners('exit');
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { runCli } = await import('../../src/cli');

		try {
			await expect(runCli(['mcp', 'start'])).resolves.toBe(0);

			console.log('after connect');
			console.info('after connect info');
			console.warn('after connect warn');
			console.debug('after connect debug');

			expect(errorSpy).toHaveBeenCalledWith('after connect');
			expect(errorSpy).toHaveBeenCalledWith('after connect info');
			expect(errorSpy).toHaveBeenCalledWith('after connect warn');
			expect(errorSpy).toHaveBeenCalledWith('after connect debug');

			const addedExitListeners = process
				.rawListeners('exit')
				.filter(listener => !originalExitListeners.includes(listener));
			expect(addedExitListeners).toHaveLength(1);

			Reflect.apply(addedExitListeners[0], process, [0]);

			expect(console.log).toBe(originalLog);
			expect(console.info).toBe(originalInfo);
			expect(console.warn).toBe(originalWarn);
			expect(console.debug).toBe(originalDebug);
		} finally {
			console.log = originalLog;
			console.info = originalInfo;
			console.warn = originalWarn;
			console.debug = originalDebug;
		}
	});

	test('restores console and exit listeners when runMcpServer rejects', async () => {
		runMcpServerMock.mockRejectedValue(new Error('boom'));
		const originalLog = console.log;
		const originalInfo = console.info;
		const originalWarn = console.warn;
		const originalDebug = console.debug;
		const originalExitListeners = process.rawListeners('exit');
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { runCli } = await import('../../src/cli');

		await expect(runCli(['mcp', 'start'])).resolves.toBe(1);

		expect(console.log).toBe(originalLog);
		expect(console.info).toBe(originalInfo);
		expect(console.warn).toBe(originalWarn);
		expect(console.debug).toBe(originalDebug);
		expect(process.rawListeners('exit')).toEqual(originalExitListeners);
		expect(errorSpy).toHaveBeenCalledWith('Error: boom');
	});
});
