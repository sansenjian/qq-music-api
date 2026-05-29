import type { Mock } from 'vitest';
import cookiesController from '../../../src/controllers/cookies';
import getImageUrlController from '../../../src/controllers/getImageUrl';
import getNewDisksController from '../../../src/controllers/getNewDisks';
import getSingerMvController from '../../../src/controllers/getSingerMv';
import getSmartboxController from '../../../src/controllers/getSmartbox';
import getTicketInfoController from '../../../src/controllers/getTicketInfo';
import getUserLikedSongsController from '../../../src/controllers/getUserLikedSongs';
import { UCommon, getSingerMv, getSmartbox, getUserLikedSongs } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers coverage boost', () => {
  let next: Mock;

  beforeEach(() => {
    next = vi.fn().mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  describe('cookies', () => {
    const originalUserInfo = global.userInfo;

    beforeEach(() => {
      global.userInfo = {
        cookie: 'uin=123;',
        cookieList: ['uin=123'],
        cookieObject: { uin: '123' },
      } as any;
    });

    afterEach(() => {
      global.userInfo = originalUserInfo;
    });

    it('returns current cookie info', async () => {
      const ctx = { status: 0, body: null } as any;

      await cookiesController.get(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        data: {
          code: 200,
          cookie: 'uin=123;',
          cookieList: ['uin=123'],
          cookieObject: { uin: '123' },
        },
      });
      expect(next).toHaveBeenCalled();
    });

    it('sets cookie headers for QQ music origin', async () => {
      const ctx = {
        request: {
          header: {},
        },
        body: null,
      } as any;

      await cookiesController.set(ctx, next);

      expect(ctx.request.cookies).toBe('uin=123;');
      expect(ctx.request.header).toMatchObject({
        'Access-Control-Allow-Origin': 'https://y.qq.com',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': true,
      });
      expect(ctx.body).toEqual({ data: { code: 200, message: '操作成功' } });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getImageUrl', () => {
    it('returns 400 when id is missing', async () => {
      const ctx = { query: {}, status: 0, body: null } as any;

      await getImageUrlController(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({ response: 'no id~~' });
      expect(next).toHaveBeenCalled();
    });

    it('builds image url with defaults', async () => {
      const ctx = { query: { id: 'abc' }, status: 0, body: null } as any;

      await getImageUrlController(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body.response.data.imageUrl).toBe(
        'https://y.gtimg.cn/music/photo_new/T002R300x300M000abc.jpg?max_age=2592000'
      );
      expect(next).toHaveBeenCalled();
    });

    it('builds image url with custom size and maxAge', async () => {
      const ctx = { query: { id: 'abc', size: '500x500', maxAge: '3600' }, status: 0, body: null } as any;

      await getImageUrlController(ctx, next);

      expect(ctx.body.response.data.imageUrl).toBe(
        'https://y.gtimg.cn/music/photo_new/T002R500x500M000abc.jpg?max_age=3600'
      );
    });
  });

  describe('getNewDisks', () => {
    it('includes area tags on first page', async () => {
      (UCommon as Mock).mockResolvedValue({ data: { code: 0 } });
      const ctx = { query: {}, status: 0, body: null } as any;

      await getNewDisksController(ctx, next);

      const props = (UCommon as Mock).mock.calls[0][0];
      const data = JSON.parse(props.params.data);
      expect(data.new_album.param).toMatchObject({ area: 1, start: 0, num: 20 });
      expect(data.new_album_tag).toMatchObject({
        module: 'newalbum.NewAlbumServer',
        method: 'get_new_album_area',
      });
      expect(ctx.body).toEqual({ response: { code: 0 } });
    });

    it('omits area tags after first page', async () => {
      (UCommon as Mock).mockResolvedValue({ data: { code: 0 } });
      const ctx = { query: { page: '2', limit: '10' }, status: 0, body: null } as any;

      await getNewDisksController(ctx, next);

      const props = (UCommon as Mock).mock.calls[0][0];
      const data = JSON.parse(props.params.data);
      expect(data.new_album.param).toMatchObject({ area: 1, start: 10, num: 10 });
      expect(data.new_album_tag).toBeUndefined();
    });
  });

  describe('getSingerMv', () => {
    it('returns 400 when singermid is missing', async () => {
      const ctx = { query: {}, status: 0, body: null } as any;

      await getSingerMvController(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({ response: 'no singermid' });
      expect(getSingerMv).not.toHaveBeenCalled();
    });

    it('adds cmd when order is time', async () => {
      (getSingerMv as Mock).mockResolvedValue({ status: 200, body: { response: { code: 0 } } });
      const ctx = { query: { singermid: 'mid', order: 'time', num: '8' }, status: 0, body: null } as any;

      await getSingerMvController(ctx, next);

      expect(getSingerMv).toHaveBeenCalledWith({
        method: 'get',
        params: { singermid: 'mid', order: 'time', num: '8', cmd: 1 },
        option: {},
      });
      expect(ctx.status).toBe(200);
    });

    it('uses first order value when query value is array', async () => {
      (getSingerMv as Mock).mockResolvedValue({ status: 200, body: { response: {} } });
      const ctx = { query: { singermid: 'mid', order: ['listen', 'time'] }, status: 0, body: null } as any;

      await getSingerMvController(ctx, next);

      expect(getSingerMv).toHaveBeenCalledWith({
        method: 'get',
        params: { singermid: 'mid', order: 'listen', num: 5 },
        option: {},
      });
    });
  });

  describe('getSmartbox', () => {
    it('returns null response when key is missing', async () => {
      const ctx = { query: {}, status: 0, body: null } as any;

      await getSmartboxController(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({ response: null });
      expect(getSmartbox).not.toHaveBeenCalled();
    });

    it('passes key to service', async () => {
      (getSmartbox as Mock).mockResolvedValue({ status: 200, body: { response: { songs: [] } } });
      const ctx = { query: { key: '周杰伦' }, status: 0, body: null } as any;

      await getSmartboxController(ctx, next);

      expect(getSmartbox).toHaveBeenCalledWith({
        method: 'get',
        params: { key: '周杰伦' },
        option: {},
      });
      expect(ctx.body).toEqual({ response: { songs: [] } });
    });
  });

  describe('getTicketInfo', () => {
    it('builds ticket index request payload', async () => {
      (UCommon as Mock).mockResolvedValue({ data: { ticket: [] } });
      const ctx = { query: {}, status: 0, body: null } as any;

      await getTicketInfoController(ctx, next);

      const props = (UCommon as Mock).mock.calls[0][0];
      const data = JSON.parse(props.params.data);
      expect(props.params).toMatchObject({
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'GB2312',
        platform: 'yqq.json',
      });
      expect(data).toMatchObject({
        comm: { ct: 24, cv: 0 },
        getFirstData: {
          module: 'mall.ticket_index_page_svr',
          method: 'GetTicketIndexPage',
          param: { city_id: -1 },
        },
        getTag: {
          module: 'mall.ticket_index_page_svr',
          method: 'GetShowTypeList',
          param: {},
        },
      });
      expect(ctx.body).toEqual({ response: { ticket: [] } });
    });
  });

  describe('getUserLikedSongs', () => {
    it('returns 400 when uin is missing', async () => {
      const ctx = { query: {}, status: 0, body: null } as any;

      await getUserLikedSongsController(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({ error: '缺少 uin 参数' });
      expect(getUserLikedSongs).not.toHaveBeenCalled();
    });

    it('normalizes pagination before calling service', async () => {
      (getUserLikedSongs as Mock).mockResolvedValue({ status: 200, body: { response: { songlist: [] } } });
      const ctx = { query: { uin: '123', offset: '10', limit: '5' }, status: 0, body: null } as any;

      await getUserLikedSongsController(ctx, next);

      expect(getUserLikedSongs).toHaveBeenCalledWith({
        uin: '123',
        offset: 10,
        limit: 5,
      });
      expect(ctx.body).toEqual({ response: { songlist: [] } });
    });
  });
});
