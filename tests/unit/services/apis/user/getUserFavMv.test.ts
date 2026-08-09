import { getUserFavMv } from '../../../../../src/services/apis/user/getUserFavMv';
import { callUserMusicu } from '../../../../../src/services/apis/user/userMusicu';

vi.mock('../../../../../src/services/apis/user/userMusicu', () => ({
	callUserMusicu: vi.fn().mockResolvedValue({ status: 200, body: { response: {} } }),
}));

describe('services/apis/user/getUserFavMv', () => {
	test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid page value: %s', async page => {
		await expect(getUserFavMv({ page })).rejects.toThrow('page must be a positive integer');
	});

	test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid limit value: %s', async limit => {
		await expect(getUserFavMv({ limit })).rejects.toThrow('limit must be a positive integer');
	});

	test('forwards valid pagination values as a zero-based upstream page', async () => {
		await getUserFavMv({ page: 2, limit: 5, euin: 'encrypted-user', cookie: 'uin=request-user' });

		expect(callUserMusicu).toHaveBeenCalledWith(
			expect.objectContaining({
				param: { pagesize: 5, num: 1, encuin: 'encrypted-user' },
			}),
		);
	});
});
