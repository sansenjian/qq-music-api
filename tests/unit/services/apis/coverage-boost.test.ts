import type { Mock } from 'vitest';
import getDigitalAlbumLists from '../../../../src/services/apis/digitalAlbum/getDigitalAlbumLists';
import getMvByTag from '../../../../src/services/apis/mv/getMvByTag';
import getRadioLists from '../../../../src/services/apis/radio/getRadioLists';
import getSmartbox from '../../../../src/services/apis/search/getSmartbox';
import getSimilarSinger from '../../../../src/services/apis/singers/getSimilarSinger';
import getSingerDesc from '../../../../src/services/apis/singers/getSingerDesc';
import getSingerMv from '../../../../src/services/apis/singers/getSingerMv';
import getSingerStarNum from '../../../../src/services/apis/singers/getSingerStarNum';
import songListCategories from '../../../../src/services/apis/songLists/songListCategories';
import songListDetail from '../../../../src/services/apis/songLists/songListDetail';
import request from '../../../../src/util/request';
import { handleApi } from '../../../../src/util/apiResponse';
import y_common from '../../../../src/services/apis/y_common';

vi.mock('../../../../src/util/request');
vi.mock('../../../../src/util/apiResponse');
vi.mock('../../../../src/services/apis/y_common');

describe('services/apis coverage boost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    (request as Mock).mockResolvedValue({ data: { code: 0 } });
    (y_common as Mock).mockResolvedValue({ data: { code: 0 } });
    (handleApi as Mock).mockImplementation((promise) => promise);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds digital album list request', async () => {
    await getDigitalAlbumLists({ method: 'post', params: { page: 2 }, option: { timeout: 1000 } });

    expect(request).toHaveBeenCalledWith({
      url: '/v8/fcg-bin/musicmall.fcg',
      method: 'post',
      options: {
        timeout: 1000,
        params: {
          page: 2,
          format: 'json',
          outCharset: 'utf-8',
          cmd: 'pc_index_new',
        },
      },
    });
    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
  });

  it('builds mv by tag request', async () => {
    await getMvByTag({ params: { tag: 'hot' }, option: { headers: { token: 't' } } });

    expect(request).toHaveBeenCalledWith({
      url: '/mv/fcgi-bin/getmv_by_tag',
      method: 'get',
      options: {
        headers: { token: 't' },
        params: {
          tag: 'hot',
          format: 'json',
          outCharset: 'GB2312',
          cmd: 'shoubo',
          lan: 'all',
        },
      },
    });
  });

  it('builds radio list request', async () => {
    await getRadioLists({ params: { channel: 'custom' } });

    const call = (request as Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      url: '/v8/fcg-bin/fcg_v8_radiolist.fcg',
      method: 'get',
    });
    expect(call.options.params).toMatchObject({
      channel: 'radio',
      page: 'index',
      tpl: 'wk',
      new: 1,
      p: 1,
      format: 'json',
      outCharset: 'utf-8',
    });
  });

  it('builds similar singer request', async () => {
    await getSimilarSinger({ params: { singermid: 'mid', num: 10 } });

    const call = (request as Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      url: '/v8/fcg-bin/fcg_v8_simsinger.fcg',
      method: 'get',
    });
    expect(call.options.params).toMatchObject({
      singermid: 'mid',
      format: 'json',
      outCharset: 'utf-8',
      utf8: 1,
      start: 0,
      num: 5,
    });
  });

  it('builds singer description request with c url flag', async () => {
    await getSingerDesc({ method: 'post', params: { singermid: 'mid' } });

    expect(request).toHaveBeenCalledWith({
      url: '/splcloud/fcgi-bin/fcg_get_singer_desc.fcg',
      method: 'post',
      isUUrl: 'c',
      options: {
        params: {
          singermid: 'mid',
          format: 'xml',
          outCharset: 'utf-8',
          utf8: 1,
          r: 1234567890,
        },
      },
    });
  });

  it('builds singer mv request', async () => {
    await getSingerMv({ params: { singermid: 'mid', begin: 10 } });

    const call = (request as Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      url: '/mv/fcgi-bin/fcg_singer_mv.fcg',
      method: 'get',
    });
    expect(call.options.params).toMatchObject({
      singermid: 'mid',
      format: 'json',
      outCharset: 'utf-8',
      cid: 205360581,
      begin: 0,
    });
  });

  it('builds singer star number request', async () => {
    await getSingerStarNum({ params: { singermid: 'mid' } });

    const call = (request as Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      url: '/rsc/fcgi-bin/fcg_order_singer_getnum.fcg',
      method: 'get',
    });
    expect(call.options.params).toMatchObject({
      singermid: 'mid',
      format: 'json',
      outCharset: 'utf-8',
      utf8: 1,
      rnd: 1234567890,
    });
  });

  it('builds smartbox request and wraps success response', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, key: 'abc' } });

    const result = await getSmartbox({ params: { key: 'abc' }, option: { timeout: 500 } });

    expect(y_common).toHaveBeenCalledWith({
      url: '/splcloud/fcgi-bin/smartbox_new.fcg',
      method: 'get',
      options: {
        timeout: 500,
        params: {
          key: 'abc',
          format: 'json',
          outCharset: 'utf-8',
          is_xml: 0,
        },
      },
    });
    expect(result).toEqual({
      status: 200,
      body: { response: { code: 0, key: 'abc' } },
    });
  });

  it('wraps smartbox request failures', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = new Error('network failed');
    (y_common as Mock).mockRejectedValue(error);

    const result = await getSmartbox({});

    expect(consoleLogSpy).toHaveBeenCalledWith('error', error);
    expect(result).toEqual({
      status: 500,
      body: { error },
    });
  });

  it('builds song list category request', async () => {
    await songListCategories({ params: { tag: 'language' } });

    expect(y_common).toHaveBeenCalledWith({
      url: '/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg',
      method: 'get',
      options: {
        params: {
          tag: 'language',
          format: 'json',
          outCharset: 'utf-8',
        },
      },
    });
    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
  });

  it('builds song list detail request', async () => {
    await songListDetail({ method: 'post', params: { disstid: '123' }, option: { timeout: 100 } });

    expect(y_common).toHaveBeenCalledWith({
      url: '/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      method: 'post',
      options: {
        timeout: 100,
        params: {
          disstid: '123',
          format: 'json',
          outCharset: 'utf-8',
          type: 1,
          json: 1,
          utf8: 1,
          onlysong: 0,
          new_format: 1,
        },
      },
    });
  });
});
