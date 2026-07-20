import { zzcSign } from '../../../../../src/services/apis/user/userMusicu';

describe('services/apis/user/userMusicu', () => {
	test('generates the canonical zzc signature for a fixed payload', () => {
		expect(zzcSign('123')).toBe('zzcec1b555gzqzg7laztguyjl2bu20r6x1w50c55f60');
	});
});
