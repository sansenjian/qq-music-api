import u_common from '../u_common';

/**
 * 推荐页聚合数据（热门分类 / 推荐歌单 / 新歌 / 新专辑 / 排行榜 / 焦点图）
 */
export default async () => {
	const data = {
		comm: { ct: 24 },
		category: {
			method: 'get_hot_category',
			param: { qq: '' },
			module: 'music.web_category_svr',
		},
		recomPlaylist: {
			method: 'get_hot_recommend',
			param: { async: 1, cmd: 2 },
			module: 'playlist.HotRecommendServer',
		},
		playlist: {
			method: 'get_playlist_by_category',
			param: { id: 8, curPage: 1, size: 40, order: 5, titleid: 8 },
			module: 'playlist.PlayListPlazaServer',
		},
		new_song: {
			module: 'newsong.NewSongServer',
			method: 'get_new_song_info',
			param: { type: 5 },
		},
		new_album: {
			module: 'newalbum.NewAlbumServer',
			method: 'get_new_album_info',
			param: { area: 1, sin: 0, num: 10 },
		},
		new_album_tag: {
			module: 'newalbum.NewAlbumServer',
			method: 'get_new_album_area',
			param: {},
		},
		toplist: {
			module: 'musicToplist.ToplistInfoServer',
			method: 'GetAll',
			param: {},
		},
		focus: {
			module: 'QQMusic.MusichallServer',
			method: 'GetFocus',
			param: {},
		},
	};

	const params = { format: 'json', data: JSON.stringify(data) };
	const res = await u_common({ method: 'get', params });
	return res.data;
};
