export type ApiMethod = 'GET' | 'POST' | 'DELETE';

export interface ApiParamMetadata {
	name: string;
	required?: boolean;
	description?: string;
}

export interface ApiMetadataItem {
	name: string;
	category: string;
	method: ApiMethod;
	path: string;
	aliases?: string[];
	queryParams?: ApiParamMetadata[];
	pathParams?: ApiParamMetadata[];
	bodyExample?: unknown;
	authRequired?: boolean;
	cookieRequired?: boolean;
}

export const apiMetadata: ApiMetadataItem[] = [
	{ name: 'getCookie', category: 'user', method: 'GET', path: '/user/getCookie' },
	{ name: 'setCookie', category: 'user', method: 'GET', path: '/user/setCookie', queryParams: [{ name: 'cookie', required: true }] },
	{ name: 'getUserPlaylists', category: 'user', method: 'GET', path: '/user/getUserPlaylists', queryParams: [{ name: 'uin', required: true }, { name: 'offset' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserDetail', category: 'user', method: 'GET', path: '/user/getUserDetail', queryParams: [{ name: 'uin', required: true }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserCollectedSongLists', category: 'user', method: 'GET', path: '/user/getUserCollectedSongLists', queryParams: [{ name: 'uin', required: true }, { name: 'page' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserCollectedAlbums', category: 'user', method: 'GET', path: '/user/getUserCollectedAlbums', queryParams: [{ name: 'uin', required: true }, { name: 'page' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserFollowSingers', category: 'user', method: 'GET', path: '/user/getUserFollowSingers', queryParams: [{ name: 'uin', required: true }, { name: 'page' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserFollowUsers', category: 'user', method: 'GET', path: '/user/getUserFollowUsers', queryParams: [{ name: 'uin', required: true }, { name: 'page' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserFans', category: 'user', method: 'GET', path: '/user/getUserFans', queryParams: [{ name: 'uin', required: true }, { name: 'page' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getUserAvatar', category: 'user', method: 'GET', path: '/user/getUserAvatar', queryParams: [{ name: 'uin' }, { name: 'k' }, { name: 'size' }] },
	{ name: 'getUserLikedSongs', category: 'user', method: 'GET', path: '/user/getUserLikedSongs', queryParams: [{ name: 'uin', required: true }, { name: 'offset' }, { name: 'limit' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getDownloadQQMusic', category: 'download', method: 'GET', path: '/downloadQQMusic' },
	{ name: 'getHotKey', category: 'search', method: 'GET', path: '/getHotkey' },
	{ name: 'getSearchByKey', category: 'search', method: 'GET', path: '/getSearchByKey', aliases: ['/getSearchByKey/:key'], queryParams: [{ name: 'key', required: true }, { name: 'limit' }, { name: 'page' }, { name: 'catZhida' }, { name: 'remoteplace' }] },
	{ name: 'getSmartbox', category: 'search', method: 'GET', path: '/getSmartbox', aliases: ['/getSmartbox/:key'], queryParams: [{ name: 'key', required: true }] },
	{ name: 'getSongListCategories', category: 'playlist', method: 'GET', path: '/getSongListCategories' },
	{ name: 'getSongLists', category: 'playlist', method: 'GET', path: '/getSongLists', aliases: ['/getSongLists/:page/:limit/:categoryId/:sortId'], queryParams: [{ name: 'limit' }, { name: 'page' }, { name: 'sortId' }, { name: 'categoryId' }] },
	{ name: 'batchGetSongLists', category: 'playlist', method: 'POST', path: '/batchGetSongLists', bodyExample: { ids: ['123'] } },
	{ name: 'getSongInfo', category: 'music', method: 'GET', path: '/getSongInfo', aliases: ['/getSongInfo/:songmid'], queryParams: [{ name: 'songmid', required: true }, { name: 'songid' }] },
	{ name: 'batchGetSongInfo', category: 'music', method: 'POST', path: '/batchGetSongInfo', bodyExample: { songs: [['songmid', 'songid']] } },
	{ name: 'getSongListDetail', category: 'playlist', method: 'GET', path: '/getSongListDetail', aliases: ['/getSongListDetail/:disstid'], queryParams: [{ name: 'disstid', required: true }] },
	{ name: 'getAlbumSongs', category: 'album', method: 'GET', path: '/getAlbumSongs', aliases: ['/getAlbumSongs/:albummid'], queryParams: [{ name: 'albummid', required: true }, { name: 'albumid' }, { name: 'begin' }, { name: 'limit' }, { name: 'order' }] },
	{ name: 'getNewDisks', category: 'album', method: 'GET', path: '/getNewDisks', queryParams: [{ name: 'page' }, { name: 'limit' }] },
	{ name: 'getMvByTag', category: 'mv', method: 'GET', path: '/getMvByTag' },
	{ name: 'getMv', category: 'mv', method: 'GET', path: '/getMv', queryParams: [{ name: 'area_id' }, { name: 'version_id' }, { name: 'limit' }, { name: 'page' }] },
	{ name: 'getMvCategory', category: 'mv', method: 'GET', path: '/getMvCategory' },
	{ name: 'getMvPlay', category: 'mv', method: 'GET', path: '/getMvPlay', queryParams: [{ name: 'vid', required: true }] },
	{ name: 'getSingerList', category: 'singer', method: 'GET', path: '/getSingerList', queryParams: [{ name: 'area' }, { name: 'sex' }, { name: 'genre' }, { name: 'index' }, { name: 'page' }] },
	{ name: 'getSingerCategory', category: 'singer', method: 'GET', path: '/getSingerCategory' },
	{ name: 'getSimilarSinger', category: 'singer', method: 'GET', path: '/getSimilarSinger', queryParams: [{ name: 'singermid', required: true }] },
	{ name: 'getSingerAlbum', category: 'singer', method: 'GET', path: '/getSingerAlbum', queryParams: [{ name: 'singermid', required: true }, { name: 'limit' }, { name: 'page' }] },
	{ name: 'getSingerHotsong', category: 'singer', method: 'GET', path: '/getSingerHotsong', queryParams: [{ name: 'singermid', required: true }, { name: 'limit' }, { name: 'page' }] },
	{ name: 'getSingerMv', category: 'singer', method: 'GET', path: '/getSingerMv', queryParams: [{ name: 'singermid', required: true }, { name: 'order' }, { name: 'num' }] },
	{ name: 'getSingerDesc', category: 'singer', method: 'GET', path: '/getSingerDesc', queryParams: [{ name: 'singermid', required: true }] },
	{ name: 'getSingerStarNum', category: 'singer', method: 'GET', path: '/getSingerStarNum', queryParams: [{ name: 'singermid', required: true }] },
	{ name: 'getRadioLists', category: 'radio', method: 'GET', path: '/getRadioLists' },
	{ name: 'getDigitalAlbumLists', category: 'album', method: 'GET', path: '/getDigitalAlbumLists' },
	{ name: 'getLyric', category: 'music', method: 'GET', path: '/getLyric', aliases: ['/getLyric/:songmid'], queryParams: [{ name: 'songmid', required: true }, { name: 'isFormat' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getMusicPlay', category: 'music', method: 'GET', path: '/getMusicPlay', aliases: ['/getMusicPlay/:songmid'], queryParams: [{ name: 'songmid', required: true }, { name: 'resType' }, { name: 'mediaId' }, { name: 'quality' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getAlbumInfo', category: 'album', method: 'GET', path: '/getAlbumInfo', aliases: ['/getAlbumInfo/:albummid'], queryParams: [{ name: 'albummid', required: true }] },
	{ name: 'getComments', category: 'comments', method: 'GET', path: '/getComments', queryParams: [{ name: 'id', required: true }, { name: 'pagesize' }, { name: 'pagenum' }, { name: 'cid' }, { name: 'cmd' }, { name: 'reqtype' }, { name: 'biztype' }, { name: 'rootcommentid' }] },
	{ name: 'getRecommend', category: 'recommend', method: 'GET', path: '/getRecommend' },
	{ name: 'getRecommendBanner', category: 'recommend', method: 'GET', path: '/getRecommendBanner' },
	{ name: 'getTopLists', category: 'rank', method: 'GET', path: '/getTopLists' },
	{ name: 'getRanks', category: 'rank', method: 'GET', path: '/getRanks' },
	{ name: 'getTicketInfo', category: 'utility', method: 'GET', path: '/getTicketInfo' },
	{ name: 'getImageUrl', category: 'utility', method: 'GET', path: '/getImageUrl', queryParams: [{ name: 'id', required: true }, { name: 'size' }, { name: 'maxAge' }] },
	{ name: 'getQQLoginQr', category: 'login', method: 'GET', path: '/getQQLoginQr', aliases: ['/user/getQQLoginQr'] },
	{ name: 'checkQQLoginQr', category: 'login', method: 'POST', path: '/checkQQLoginQr', aliases: ['/user/checkQQLoginQr'] },
	{ name: 'getDailyRecommend', category: 'recommend', method: 'GET', path: '/getDailyRecommend', cookieRequired: true },
	{ name: 'getPrivateFM', category: 'recommend', method: 'GET', path: '/getPrivateFM', cookieRequired: true },
	{ name: 'getNewSongs', category: 'recommend', method: 'GET', path: '/getNewSongs', queryParams: [{ name: 'areaId' }, { name: 'limit' }] },
	{ name: 'getPersonalRecommend', category: 'recommend', method: 'GET', path: '/getPersonalRecommend', queryParams: [{ name: 'type' }, { name: 'cookie' }], cookieRequired: true },
	{ name: 'getSimilarSongs', category: 'recommend', method: 'GET', path: '/getSimilarSongs', queryParams: [{ name: 'songmid', required: true }] },
	{ name: 'getRelatedPlaylists', category: 'recommend', method: 'GET', path: '/getRelatedPlaylists', queryParams: [{ name: 'songid', required: true }, { name: 'sin' }, { name: 'lastId' }, { name: 'songType' }] },
	{ name: 'getRelatedMv', category: 'recommend', method: 'GET', path: '/getRelatedMv', queryParams: [{ name: 'songid', required: true }, { name: 'songtype' }, { name: 'lastmvid' }, { name: 'limit' }] },
	{ name: 'getPlaylistTags', category: 'playlist', method: 'GET', path: '/getPlaylistTags' },
	{ name: 'getPlaylistsByTag', category: 'playlist', method: 'GET', path: '/getPlaylistsByTag', queryParams: [{ name: 'tagId' }, { name: 'page' }, { name: 'num' }] },
	{ name: 'getHotComments', category: 'comments', method: 'GET', path: '/getHotComments', queryParams: [{ name: 'id', required: true }, { name: 'type' }, { name: 'page' }, { name: 'pagesize' }] },
	{ name: 'getSingerListByArea', category: 'singer', method: 'GET', path: '/getSingerListByArea', queryParams: [{ name: 'area' }, { name: 'sex' }, { name: 'genre' }, { name: 'page' }, { name: 'pagesize' }] },
];

export const apiMetadataPaths = apiMetadata.flatMap(item => [item.path, ...(item.aliases || [])]);
