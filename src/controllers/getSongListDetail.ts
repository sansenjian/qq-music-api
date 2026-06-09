import { KoaContext } from '../routes/types';
import { songListDetail } from '../services';
import { setApiResponse, withErrorHandler } from './util';

const getSongListDetailController = withErrorHandler(async (ctx: KoaContext) => {
  const disstid = ctx.query.disstid || ctx.params.disstid;

  if (!disstid) {
    setApiResponse(ctx, { status: 400, body: { response: 'no disstid' } });
    return;
  }
  
  const props = {
    method: 'get',
    params: {
      disstid
    },
    option: {}
  };
  
  const result = await songListDetail(props);
  setApiResponse(ctx, result);
});

export default getSongListDetailController;
