import type { Mock } from 'vitest';
import getRanks from '../../../../../src/services/apis/rank/getRanks';
import u_common from '../../../../../src/services/apis/u_common';

vi.mock('../../../../../src/services/apis/u_common');

describe('services/apis/rank/getRanks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('should request rank detail with default parameters', async () => {
		(u_common as Mock).mockResolvedValue({ data: {} });

		await getRanks();

		expect(u_common).toHaveBeenCalledWith({
			method: 'get',
			params: {
				format: 'json',
				data: expect.any(String),
			},
		});

		const callArgs = (u_common as Mock).mock.calls[0][0];
		const dataParam = JSON.parse(callArgs.params.data);
		expect(dataParam.req_1.param).toMatchObject({ topId: 4, num: 20, offset: 0 });
		expect(dataParam.req_1.param.period).toEqual(expect.any(String));
	});

	test('should accept custom topId, num, and offset', async () => {
		(u_common as Mock).mockResolvedValue({ data: {} });

		await getRanks({ topId: 10, num: 50, offset: 5 });

		const callArgs = (u_common as Mock).mock.calls[0][0];
		const dataParam = JSON.parse(callArgs.params.data);
		expect(dataParam.req_1.param).toMatchObject({ topId: 10, num: 50, offset: 5 });
	});

	test('should build correct comm and req_1 module config', async () => {
		(u_common as Mock).mockResolvedValue({ data: {} });

		await getRanks({ topId: 10, num: 30, offset: 2 });

		const callArgs = (u_common as Mock).mock.calls[0][0];
		const dataParam = JSON.parse(callArgs.params.data);
		expect(dataParam.comm).toMatchObject({
			ct: 24,
			cv: 4747474,
			format: 'json',
			inCharset: 'utf-8',
			needNewCode: 1,
			uin: 0,
		});
		expect(dataParam.req_1).toMatchObject({
			module: 'musicToplist.ToplistInfoServer',
			method: 'GetDetail',
			param: {
				topId: 10,
				offset: 2,
				num: 30,
				period: expect.any(String),
			},
		});
	});

	test('should normalize song mid from mid field', async () => {
		const mockResponse = {
			req_1: { data: { data: { songInfoList: [{ songId: 123, mid: 'test_mid_1', songName: 'Song 1' }] } } },
		};
		(u_common as Mock).mockResolvedValue({ data: mockResponse });

		const result = await getRanks();

		const songList = result.req_1!.data!.data!.songInfoList!;
		expect(songList[0].song_mid).toBe('test_mid_1');
		expect(songList[0].mid).toBe('test_mid_1');
		expect(songList[0].song_id).toBe(123);
		expect(songList[0].songId).toBe(123);
	});

	test('should NOT resolve mid by default', async () => {
		const mockResponse = {
			req_1: { data: { data: { songInfoList: [{ songId: 123, songName: 'Song without mid' }] } } },
		};
		(u_common as Mock).mockResolvedValue({ data: mockResponse });

		const result = await getRanks();

		expect(u_common).toHaveBeenCalledTimes(1);
		const songList = result.req_1!.data!.data!.songInfoList!;
		expect(songList[0].song_mid).toBeUndefined();
	});

	test('should populate song_mid via detail API when resolveMid=true', async () => {
		const rankResponse = {
			req_1: { data: { data: { songInfoList: [{ songId: 123, songName: 'Song without mid' }] } } },
		};
		const detailResponse = {
			songinfo: { data: { track_info: { mid: 'detail_mid_123' } } },
		};

		(u_common as Mock).mockResolvedValueOnce({ data: rankResponse }).mockResolvedValueOnce({ data: detailResponse });

		const result = await getRanks({ resolveMid: true });

		expect(u_common).toHaveBeenCalledTimes(2);
		const detailCall = (u_common as Mock).mock.calls[1][0];
		expect(JSON.parse(detailCall.params.data).songinfo.param.song_id).toBe(123);
		const songList = result.req_1!.data!.data!.songInfoList!;
		expect(songList[0].song_mid).toBe('detail_mid_123');
		expect(songList[0].mid).toBe('detail_mid_123');
	});

	test('should deduplicate detail requests and cap concurrency at 5', async () => {
		const songInfoList = [1, 2, 3, 4, 5, 6, 7, 1].map(songId => ({ songId }));
		const rankResponse = { req_1: { data: { data: { songInfoList } } } };
		let activeRequests = 0;
		let maxActiveRequests = 0;

		(u_common as Mock).mockResolvedValueOnce({ data: rankResponse }).mockImplementation(async ({ params }) => {
			activeRequests += 1;
			maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
			await new Promise(resolve => setTimeout(resolve, 5));
			activeRequests -= 1;

			const songId = JSON.parse(params.data).songinfo.param.song_id;
			return { data: { songinfo: { data: { track_info: { mid: `mid_${songId}` } } } } };
		});

		const result = await getRanks({ resolveMid: true });

		expect(u_common).toHaveBeenCalledTimes(8);
		expect(maxActiveRequests).toBe(5);
		expect(result.req_1!.data!.data!.songInfoList!.map(song => song.mid)).toEqual([
			'mid_1',
			'mid_2',
			'mid_3',
			'mid_4',
			'mid_5',
			'mid_6',
			'mid_7',
			'mid_1',
		]);
	});
});
