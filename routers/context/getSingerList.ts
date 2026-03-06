import { KoaContext, Controller } from '../types';
import { UCommon } from '../../module';

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
  
  await UCommon(props)
    .then(res => {
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        status: 200,
        response
      };
    })
    .catch(error => {
      console.error('getSingerList error:', error);
      ctx.status = 500;
      ctx.body = {
        error: '服务器内部错误'
      };
    });
};

export default controller;
