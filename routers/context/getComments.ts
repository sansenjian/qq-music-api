import { KoaContext, Controller } from '../types';
import { getComments } from '../../module';

const controller: Controller = async (ctx, next) => {
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

  const params = Object.assign({
    cid,
    reqtype,
    biztype,
    topid: id,
    cmd,
    pagenum,
    pagesize,
    lasthotcommentid: rootcommentid
  });
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  if (id && checkrootcommentid) {
    const { status, body } = await getComments(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      data: {
        message: 'Don\'t have id or rootcommentid'
      }
    };
  }
};

export default controller;
