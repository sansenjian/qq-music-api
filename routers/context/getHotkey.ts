import { KoaContext } from '../types';
import { getHotKey } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';

const getHotkeyController = withErrorHandler(async (ctx: KoaContext) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };

  if (process.env.DEBUG === 'true') {
    console.log('[getHotkey] controller props:', props);
  }

  const result = await getHotKey(props);

  if (process.env.DEBUG === 'true') {
    console.log('[getHotkey] controller response status:', result.status);
  }

  setApiResponse(ctx, result);
});

export default getHotkeyController;
