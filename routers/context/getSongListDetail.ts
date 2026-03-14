import { KoaContext } from '../types';
import { songListDetail } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';

const getSongListDetailController = withErrorHandler(async (ctx: KoaContext) => {
  const { disstid } = ctx.query;
  
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
