import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  
  const { status, body } = await (require('../../module').getDigitalAlbumLists)(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
