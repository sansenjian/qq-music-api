import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { area = -100, sex = -100, genre = -100, index = -100, page = 1 } = ctx.query;
  
  const pageNum = Number(page);
  const data = {
    comm: {
      ct: 24,
      cv: 0
    },
    singerList: {
      module: 'Music.SingerListServer',
      method: 'get_singer_list',
      param: {
        area: Number(area),
        sex: Number(sex),
        genre: Number(genre),
        index: Number(index),
        sin: (pageNum - 1) * 80,
        cur_page: pageNum
      }
    }
  };
  
  const params = Object.assign({
    format: 'json',
    data: JSON.stringify(data)
  });
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  await (require('../../module').UCommon)(props)
    .then(res => {
      console.log(res);
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        status: 200,
        response
      };
    })
    .catch(error => {
      console.log('error', error);
    });
};

export default controller;
