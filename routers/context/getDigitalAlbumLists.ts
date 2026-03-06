import { KoaContext, Controller } from '../types';
import { getDigitalAlbumLists } from '../../module';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  
  const { status, body } = await getDigitalAlbumLists(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
