import { KoaContext } from '../types';
import { getComments } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { errorResponse } from '../../util/apiResponse';

const getCommentsController = withErrorHandler(async (ctx: KoaContext) => {
  const {
    id,
    pagesize = 25,
    pagenum = 0,
    cid = 205360772,
    cmd = 8,
    reqtype = 2,
    biztype = 1,
    rootcommentid = !pagenum && ''
  } = ctx.query;
  
  const checkrootcommentid = !pagenum ? true : !!rootcommentid;

  const params = {
    cid,
    reqtype,
    biztype,
    topid: id,
    cmd,
    pagenum,
    pagesize,
    lasthotcommentid: rootcommentid
  };
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  if (!id || !checkrootcommentid) {
    setApiResponse(ctx, errorResponse('Don\'t have id or rootcommentid', 400));
    return;
  }
  
  const result = await getComments(props);
  setApiResponse(ctx, result);
});

export default getCommentsController;
