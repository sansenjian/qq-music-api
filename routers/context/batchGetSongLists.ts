import { KoaContext, Controller } from '../types';
import { songLists } from '../../module';

const controller: Controller = async (ctx, next) => {
	const { limit: ein = 19, page: sin = 0, sortId = 5, categoryIds = [10000000] } = ctx.request.body || {};

  const params = {
    sortId,
    sin,
    ein
  };

  const props = {
    method: 'get',
    option: {},
    params
  };

  const data = await Promise.all(
    categoryIds.map(
      async (categoryId: number) =>
        await songLists({
          ...props,
          params: {
            ...params,
            categoryId
          }
        }).then(res => {
          if (res.body.response && +res.body.response.code === 0) {
            return res.body.response.data;
          } else {
            return res.body.response;
          }
        })
    )
  );
  
  Object.assign(ctx, {
    body: {
      status: 200,
      data
    }
  });
};

export default controller;
