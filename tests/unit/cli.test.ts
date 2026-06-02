describe('CLI', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('points legacy MCP command users to the separate MCP package', async () => {
		const stdout = vi.fn();
		const stderr = vi.fn();
		const { runCli } = await import('../../src/cli');

		await expect(runCli(['mcp', 'start'], { stdout, stderr })).resolves.toBe(1);

		expect(stdout).not.toHaveBeenCalled();
		expect(stderr).toHaveBeenCalledWith(
			'Error: MCP support moved to @sansenjian/qq-music-api-mcp. Install it and run qq-music-api-mcp instead.',
		);
	});

	test('reports legacy MCP command errors as JSON when requested', async () => {
		const stdout = vi.fn();
		const stderr = vi.fn();
		const { runCli } = await import('../../src/cli');

		await expect(runCli(['mcp', 'start', '--json'], { stdout, stderr })).resolves.toBe(1);

		expect(stdout).not.toHaveBeenCalled();
		expect(stderr).toHaveBeenCalledTimes(1);
		expect(JSON.parse(String(stderr.mock.calls[0]?.[0]))).toMatchObject({
			ok: false,
			error: {
				code: 'MCP_PACKAGE_REQUIRED',
				message: expect.any(String),
			},
		});
	});
});
