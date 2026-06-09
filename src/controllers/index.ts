import type { Controller } from '../routes/types';

type Controllers = Record<string, Controller>;

// Import refactored controllers
import getDownloadQQMusicController from './getDownloadQQMusic';
import getHotkeyController from './getHotkey';
import getSearchByKeyController from './getSearchByKey';
import getSmartboxController from './getSmartbox';
import getSongListCategoriesController from './getSongListCategories';
import getSongListsController from './getSongLists';
import batchGetSongListsController from './batchGetSongLists';
import getSongInfoController from './getSongInfo';
import batchGetSongInfoController from './batchGetSongInfo';
import getSongListDetailController from './getSongListDetail';
import getAlbumSongsController from './getAlbumSongs';
import getNewDisksController from './getNewDisks';
import getMvByTagController from './getMvByTag';
import getMvController from './getMv';
import getMvCategoryController from './getMvCategory';
import getSingerListController from './getSingerList';
import getSingerCategoryController from './getSingerCategory';
import getSimilarSingerController from './getSimilarSinger';
import getSingerAlbumController from './getSingerAlbum';
import getSingerHotsongController from './getSingerHotsong';
import getSingerMvController from './getSingerMv';
import getSingerDescController from './getSingerDesc';
import getSingerStarNumController from './getSingerStarNum';
import getRadioListsController from './getRadioLists';
import getDigitalAlbumListsController from './getDigitalAlbumLists';
import getLyricController from './getLyric';
import getMusicPlayController from './getMusicPlay';
import getAlbumInfoController from './getAlbumInfo';
import getCommentsController from './getComments';
import getRecommendController from './getRecommend';
import getRecommendBannerController from './getRecommendBanner';
import getRelatedPlaylistsController from './getRelatedPlaylists';
import getRelatedMvController from './getRelatedMv';
import getMvPlayController from './getMvPlay';
import getTopListsController from './getTopLists';
import getRanksController from './getRanks';
import getTicketInfoController from './getTicketInfo';
import getImageUrlController from './getImageUrl';
import getQQLoginQrController from './getQQLoginQr';
import checkQQLoginQrController from './checkQQLoginQr';
import cookiesController from './cookies';
import getUserPlaylistsController from './getUserPlaylists';
import getUserAvatarController from './getUserAvatar';
import getUserLikedSongsController from './getUserLikedSongs';
import {
	getUserCollectedAlbumsController,
	getUserCollectedSongListsController,
	getUserDetailController,
	getUserFansController,
	getUserFollowSingersController,
	getUserFollowUsersController,
} from './getUserReadonlyExtras';
import { getDailyRecommendController, getPrivateFMController, getNewSongsController } from './getDailyRecommend';
import { getPersonalRecommendController, getSimilarSongsController } from './getPersonalRecommend';
import {
	getPlaylistTagsController,
	getPlaylistsByTagController,
	getHotCommentsController,
	getSingerListByAreaController,
} from './getPlaylistTags';

// Export all controllers with consistent naming
const controllers: Controllers = {
	getCookie: cookiesController.get,
	setCookie: cookiesController.set,
	getDownloadQQMusic: getDownloadQQMusicController,
	getHotKey: getHotkeyController,
	getSearchByKey: getSearchByKeyController,
	getSmartbox: getSmartboxController,
	getSongListCategories: getSongListCategoriesController,
	getSongLists: getSongListsController,
	batchGetSongLists: batchGetSongListsController,
	getSongInfo: getSongInfoController,
	batchGetSongInfo: batchGetSongInfoController,
	getSongListDetail: getSongListDetailController,
	getAlbumSongs: getAlbumSongsController,
	getNewDisks: getNewDisksController,
	getMvByTag: getMvByTagController,
	getMv: getMvController,
	getMvCategory: getMvCategoryController,
	getSingerList: getSingerListController,
	getSingerCategory: getSingerCategoryController,
	getSimilarSinger: getSimilarSingerController,
	getSingerAlbum: getSingerAlbumController,
	getSingerHotsong: getSingerHotsongController,
	getSingerMv: getSingerMvController,
	getSingerDesc: getSingerDescController,
	getSingerStarNum: getSingerStarNumController,
	getRadioLists: getRadioListsController,
	getDigitalAlbumLists: getDigitalAlbumListsController,
	getLyric: getLyricController,
	getMusicPlay: getMusicPlayController,
	getAlbumInfo: getAlbumInfoController,
	getComments: getCommentsController,
	getRecommend: getRecommendController,
	getRecommendBanner: getRecommendBannerController,
	getRelatedPlaylists: getRelatedPlaylistsController,
	getRelatedMv: getRelatedMvController,
	getMvPlay: getMvPlayController,
	getTopLists: getTopListsController,
	getRanks: getRanksController,
	getTicketInfo: getTicketInfoController,
	getImageUrl: getImageUrlController,
	getQQLoginQr: getQQLoginQrController,
	checkQQLoginQr: checkQQLoginQrController,
	getUserPlaylists: getUserPlaylistsController,
	getUserAvatar: getUserAvatarController,
	getUserLikedSongs: getUserLikedSongsController,
	getUserDetail: getUserDetailController,
	getUserCollectedSongLists: getUserCollectedSongListsController,
	getUserCollectedAlbums: getUserCollectedAlbumsController,
	getUserFollowSingers: getUserFollowSingersController,
	getUserFollowUsers: getUserFollowUsersController,
	getUserFans: getUserFansController,
	getDailyRecommend: getDailyRecommendController,
	getPrivateFM: getPrivateFMController,
	getNewSongs: getNewSongsController,
	getPersonalRecommend: getPersonalRecommendController,
	getSimilarSongs: getSimilarSongsController,
	getPlaylistTags: getPlaylistTagsController,
	getPlaylistsByTag: getPlaylistsByTagController,
	getHotComments: getHotCommentsController,
	getSingerListByArea: getSingerListByAreaController,
};

export default controllers;
