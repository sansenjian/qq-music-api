const { UCommon } = require('../../module');
const { commonParams } = require('../../module/config');

// 缓存 date-fns 模块（避免每次请求都导入）
let dateFnsCache = null;
async function getDateFns() {
	if (!dateFnsCache) {
		dateFnsCache = await import('date-fns');
	}
	return dateFnsCache;
}

module.exports = async (ctx, next) => {
	// 异步加载 date-fns (ESM 模块，带缓存)
	const { getISOWeekYear, getISOWeek, parseISO } = await getDateFns();
	
	// Desc: https://github.com/sansenjian/qq-music-api/issues/14
	// 1. topId is useless
	// 2. qq api period is change not YYYY-MM-DD
	const topId = +ctx.query.topId || 4;
	const num = +ctx.query.limit || 20;
	const offset = +ctx.query.page || 0;
	// 支持日期格式：YYYY-MM-DD 或 ISO 8601 格式，无效时自动使用当前日期
	// 使用 parseISO 确保日期字符串被解析为本地时间，避免 UTC 偏移问题
	let date = ctx.query.period ? parseISO(ctx.query.period) : new Date();
	// 验证日期是否有效，无效则使用当前日期
	if (Number.isNaN(date.getTime())) {
		date = new Date();
	}
	const week = getISOWeek(date);
	const isoWeekYearVal = getISOWeekYear(date);
	const period = `${isoWeekYearVal}_${week}`;

	const data = {
		comm: {
			...(commonParams || {}),
			cv: 4747474,
			ct: 24,
			format: 'json',
			inCharset: 'utf-8',
			needNewCode: 1,
			uin: 0,
		},
		req_1: {
			module: 'musicToplist.ToplistInfoServer',
			method: 'GetDetail',
			param: {
				topId,
				offset,
				num,
				period,
			},
		},
		// TODO: 新评论，之后迭代更新再说
		// req_2: {
		// 	module: 'music.globalComment.CommentReadServer',
		// 	method: 'GetNewCommentList',
		// 	param: {
		// 		BizType: 4,
		// 		BizId: '59',
		// 		LastCommentSeqNo: '',
		// 		PageSize: 25,
		// 		PageNum: 0,
		// 		FromCommentId: '',
		// 		WithHot: 1,
		// 	},
		// },
		// TODO: 热门评论，之后迭代更新再说
		// req_3: {
		// 	module: 'music.globalComment.CommentReadServer',
		// 	method: 'GetHotCommentList',
		// 	param: {
		// 		BizType: 4,
		// 		BizId: '59',
		// 		LastCommentSeqNo: '',
		// 		PageSize: 15,
		// 		PageNum: 0,
		// 		HotType: 2,
		// 		WithAirborne: 1,
		// 	},
		// },
	};
	const params = Object.assign({
		format: 'json',
		data: JSON.stringify(data),
	});
	const props = {
		method: 'get',
		params,
		option: {},
	};
	await UCommon(props)
		.then(res => {
			const response = res.data;
			ctx.status = 200;
			ctx.body = {
				response,
			};
		})
		.catch(error => {
			console.log('error', error);
		});
};
