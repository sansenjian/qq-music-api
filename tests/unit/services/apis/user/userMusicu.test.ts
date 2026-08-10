import { setUserInfo } from '../../../../../src/config/user-info-store';
import { callUserMusicu, zzcSign } from '../../../../../src/services/apis/user/userMusicu';
import { getGtk } from '../../../../../src/util/loginUtils';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('../../../../../src/util/request', () => ({ default: requestMock }));

describe('services/apis/user/userMusicu', () => {
	beforeEach(() => {
		requestMock.mockReset().mockResolvedValue({ data: { code: 0 } });
		setUserInfo({
			loginUin: 'global-login',
			uin: 'global-uin',
			cookie: 'uin=global-cookie; qqmusic_key=global-key; p_skey=global-skey',
			cookieList: [],
			cookieObject: {},
			refreshData: () => ({}),
		});
	});

	test('generates the canonical zzc signature for a fixed payload', () => {
		expect(zzcSign('123')).toBe('zzcec1b555gzqzg7laztguyjl2bu20r6x1w50c55f60');
	});

	test('does not mix default-session credentials into an explicit cookie', async () => {
		await callUserMusicu({
			module: 'test.module',
			method: 'TestMethod',
			param: {},
			cookie: 'uin=request-user',
		});

		const payload = JSON.parse(requestMock.mock.calls[0][0].options.data);
		expect(payload.comm).toMatchObject({ uin: 'request-user', loginUin: 'request-user' });
		expect(payload.comm).not.toHaveProperty('authst');
		expect(payload.comm).not.toHaveProperty('g_tk');
	});

	test('uses default-session credentials when no explicit cookie is provided', async () => {
		await callUserMusicu({
			module: 'test.module',
			method: 'TestMethod',
			param: {},
		});

		const payload = JSON.parse(requestMock.mock.calls[0][0].options.data);
		expect(payload.comm).toMatchObject({
			uin: 'global-cookie',
			loginUin: 'global-cookie',
			authst: 'global-key',
			g_tk: getGtk('global-skey'),
		});
	});
});
