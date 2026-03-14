import { KoaContext, Controller } from '../types';
import { getMusicPlay } from '../../module';
import { resolveRequestCookie } from '../../util/cookieResolver';

const controller: Controller = async (ctx, next) => {
  const songmid = ctx.query.songmid ?? ctx.params.songmid;
  const resType = Array.isArray(ctx.query.resType) ? ctx.query.resType[0] : ctx.query.resType;
  const mediaId = Array.isArray(ctx.query.mediaId) ? ctx.query.mediaId[0] : ctx.query.mediaId;
  const quality = Array.isArray(ctx.query.quality) ? ctx.query.quality[0] : ctx.query.quality;

  const { cookie: effectiveCookie } = resolveRequestCookie(ctx);

  const headers: Record<string, string> = {};
  if (effectiveCookie) {
    headers.Cookie = effectiveCookie;
  }

  const props: {
    method: 'get';
    params: {
      songmid?: string | string[];
      resType?: string;
      mediaId?: string;
      quality?: string;
    };
    option: {
      headers: Record<string, string>;
    };
  } = {
    method: 'get',
    params: {
      songmid,
      resType,
      mediaId,
      quality
    },
    option: {
      headers
    }
  };

  const { status, body } = await getMusicPlay(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
